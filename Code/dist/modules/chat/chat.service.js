"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const service_1 = require("./../../common/service");
const Repository_1 = require("../../DB/Repository");
const conversationKey_1 = require("../../common/utils/conversationKey");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const ObjectId_1 = require("../../common/utils/ObjectId");
class ChatService {
    ChatRepository;
    UserRepository;
    MessageRepository;
    NotificationRepository;
    redis;
    s3;
    notificationService;
    constructor() {
        this.ChatRepository = new Repository_1.ChatRepository();
        this.UserRepository = new Repository_1.UserRepository();
        this.MessageRepository = new Repository_1.MessageRepository();
        this.NotificationRepository = new Repository_1.NotificationRepository();
        this.redis = service_1.redisService;
        this.s3 = service_1.s3Service;
        this.notificationService = service_1.notificationService;
    }
    async sendNotification(user, data) {
        try {
            if (data?.participants?.length) {
                const tokens = await this.redis.getFCMsMulti(data.participants);
                if (tokens.length) {
                    await this.notificationService.sendNotifications({ tokens, data: { title: `${user.userName} add you to his group`, body: "✅" } });
                    await this.NotificationRepository.create({ data: { senderId: user._id, body: data.content || "✅", title: `${user.userName} add new participant to group`, recipientId: data.reciverId, referenceId: data._id, referenceModel: enum_1.notificationModelEnum.CHAT } });
                }
            }
        }
        catch (err) {
            console.error(err);
            throw new exception_1.BadRequestException(`Fail to send Notification`, { error: err });
        }
    }
    async handleGroupActionBackground(actor, group, targetUserIds, action) {
        try {
            const actorIdStr = actor._id.toString();
            const currentParticipants = group.participants.map(id => id.toString());
            let allPossibleRecipients = [];
            if (action === enum_1.GroupActionType.ADD) {
                const combined = [...currentParticipants, ...targetUserIds];
                allPossibleRecipients = Array.from(new Set(combined)).filter(recipientId => recipientId !== actorIdStr);
            }
            else {
                allPossibleRecipients = currentParticipants.filter(recipientId => recipientId !== actorIdStr);
            }
            if (allPossibleRecipients.length === 0)
                return;
            const notificationRecords = [];
            for (const recipientId of allPossibleRecipients) {
                let pushBody = "";
                let dbBody = "";
                let dbTitle = "Group Update";
                const isTarget = targetUserIds.includes(recipientId);
                switch (action) {
                    case enum_1.GroupActionType.ADD:
                        if (isTarget) {
                            pushBody = `${actor.userName} added you to the group`;
                            dbBody = `You were added to ${group.groupName || 'the group'}`;
                        }
                        else {
                            pushBody = `${actor.userName} added new members to ${group.groupName || 'the group'}`;
                            dbBody = `${actor.userName} added new members to the group`;
                        }
                        break;
                    case enum_1.GroupActionType.REMOVE:
                        if (isTarget) {
                            pushBody = `You have been removed from the group by ${actor.userName}`;
                            dbBody = `You were removed from ${group.groupName || 'the group'}`;
                        }
                        else {
                            pushBody = `${actor.userName} removed a member from ${group.groupName || 'the group'}`;
                            dbBody = `A member was removed from the group`;
                        }
                        break;
                    case enum_1.GroupActionType.PROMOTE:
                        if (isTarget) {
                            pushBody = `You have been promoted to Admin by ${actor.userName}`;
                            dbBody = `You were promoted to Admin in ${group.groupName || 'the group'}`;
                        }
                        else {
                            pushBody = `${actor.userName} promoted a member to Admin in ${group.groupName || 'the group'}`;
                            dbBody = `A member was promoted to Admin`;
                        }
                        break;
                    case enum_1.GroupActionType.LEAVE:
                        if (!isTarget) {
                            pushBody = `${actor.userName} left the group`;
                            dbBody = `${actor.userName} left ${group.groupName || 'the group'}`;
                            dbTitle = "Member Left";
                        }
                        else {
                            continue;
                        }
                        break;
                }
                const token = await this.redis.getFCMsMulti([recipientId]);
                if (token && token.length > 0) {
                    this.notificationService.sendNotifications({
                        tokens: token,
                        data: { title: group.groupName || "Group Update", body: pushBody }
                    }).catch(err => console.error(`⚡ Failed to send push to ${recipientId}:`, err));
                }
                notificationRecords.push({
                    senderId: actor._id,
                    body: dbBody,
                    title: dbTitle,
                    recipientId: (0, ObjectId_1.TransformToObjectId)(recipientId),
                    referenceId: group._id,
                    referenceModel: "Chat"
                });
            }
            if (notificationRecords.length > 0) {
                await this.NotificationRepository.create({ data: notificationRecords });
            }
        }
        catch (error) {
            console.error(`⚡ Error in background task for group action [${action}]:`, error);
        }
    }
    async sendMessage(user, data) {
        let chatId = data.chatId;
        if (!chatId) {
            const key = (0, conversationKey_1.conversationKey)({ senderId: user._id, reciverId: data.receiverId });
            let chat = await this.ChatRepository.findOne({
                filter: { conversationKey: key },
                options: { lean: true }
            });
            if (!chat) {
                chat = await this.ChatRepository.create({
                    data: {
                        chatType: data.chatType || enum_1.chatTypeEnum.OVO,
                        conversationKey: key,
                        participants: [user._id, data.receiverId],
                    }
                });
            }
            chatId = chat._id;
        }
        const message = await this.MessageRepository.create({
            data: {
                chatId: chatId,
                senderId: user._id,
                content: data.content,
                attachments: data.attachments || [],
                seenBy: [user._id],
                deliveredTo: [user._id],
                replyTo: data.replyTo,
                mentions: data.mentions || []
            },
        });
        if (!message) {
            throw new exception_1.BadRequestException("Message creation failed");
        }
        setImmediate(() => {
            this.ChatRepository.updateOne({
                filter: { _id: chatId },
                update: { $set: { lastMessageId: message._id } }
            }).catch(err => console.error("⚡ Background update failed:", err));
            this.sendNotification(user, data).catch(err => console.error("⚡ Notification failed:", err));
        });
        return message;
    }
    async getChat(user, query) {
        const { limit, cursor, receiverId, chatId } = query;
        let chat;
        if (chatId) {
            chat = await this.ChatRepository.findOne({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(chatId) },
                options: { lean: true, populate: [{ path: "participants", select: "firstName lastName profileImage" }] }
            });
        }
        else if (receiverId) {
            const key = (0, conversationKey_1.conversationKey)({ senderId: user._id, reciverId: receiverId });
            chat = await this.ChatRepository.findOne({ filter: { conversationKey: key },
                options: { lean: true, populate: [{ path: "participants", select: "firstName lastName profileImage" }] }
            });
        }
        if (!chat) {
            throw new exception_1.NotFoundException("Chat not found");
        }
        let filter = { chatId: chat._id };
        if (cursor) {
            filter.createdAt = { $lt: cursor };
        }
        const messages = await this.MessageRepository.find({ filter, options: { lean: true, sort: { createdAt: -1 }, limit: Number(limit) || 6 } });
        const nextCursor = messages.length ? messages[messages.length - 1]?.createdAt : null;
        return { chat, messages: messages, nextCursor };
    }
    async createGroup(user, data) {
        const { participants, admins } = data;
        const allUserIds = [...new Set([...participants, ...admins])];
        const usersExists = await this.UserRepository.find({ filter: { _id: { $in: allUserIds } } });
        if (!usersExists.length) {
            throw new exception_1.NotFoundException("Fail to find some users");
        }
        const group = await this.ChatRepository.create({ data });
        return group;
    }
    async addParticipants(user, data) {
        const { chatId, participants } = data;
        const newParticipantIds = participants.map(id => id.toString()).filter(id => id !== user._id.toString());
        if (newParticipantIds.length === 0) {
            throw new exception_1.BadRequestException("No valid new participants provided");
        }
        const existingUsers = await this.UserRepository.find({ filter: { _id: { $in: newParticipantIds } }, options: { lean: true }, projection: "_id" });
        if (existingUsers.length !== newParticipantIds.length) {
            throw new exception_1.NotFoundException("Some users do not exist in the system");
        }
        const group = await this.ChatRepository.findOneAndUpdate({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(chatId), admins: user._id, chatType: enum_1.chatTypeEnum.OVM }, update: { $addToSet: { participants: { $each: participants } } }, options: { lean: true, new: true } });
        if (!group) {
            throw new exception_1.NotFoundException("Chat not found or you are not an admin of this group");
        }
        setImmediate(() => {
            this.handleGroupActionBackground(user, group, newParticipantIds || [], enum_1.GroupActionType.ADD);
        });
        return group;
    }
    async removeParticipant(user, data) {
        const { chatId, userId } = data;
        if (user._id.toString() === userId) {
            throw new exception_1.BadRequestException("You cannot remove yourself from the group. Use leaveGroup instead.");
        }
        const existingUser = await this.UserRepository.findOne({ filter: { _id: userId } });
        if (!existingUser) {
            throw new exception_1.NotFoundException("This user not exist");
        }
        const group = await this.ChatRepository.findOneAndUpdate({ filter: { _id: chatId, admins: user._id, chatType: enum_1.chatTypeEnum.OVM }, update: { $pull: { participants: (0, ObjectId_1.TransformToObjectId)(userId), admins: (0, ObjectId_1.TransformToObjectId)(userId) } }, options: { lean: true, new: true } });
        if (!group) {
            throw new exception_1.NotFoundException("Operation failed. Either chat not found, you are not an admin, or the user is not in this group.");
        }
        setImmediate(() => {
            this.handleGroupActionBackground(user, group, [userId], enum_1.GroupActionType.REMOVE);
        });
        return group;
    }
    async promoteToAdmin(user, data) {
        const { chatId, userId } = data;
        if (user._id.toString() === userId) {
            throw new exception_1.BadRequestException("You cannot promote yourself.");
        }
        const existingUser = await this.UserRepository.findOne({ filter: { _id: userId } });
        if (!existingUser) {
            throw new exception_1.NotFoundException("This user not exist");
        }
        const group = await this.ChatRepository.findOneAndUpdate({ filter: { _id: chatId, admins: user._id, chatType: enum_1.chatTypeEnum.OVM, participants: (0, ObjectId_1.TransformToObjectId)(userId) }, update: { $addToSet: { admins: (0, ObjectId_1.TransformToObjectId)(userId) } }, options: { lean: true, new: true } });
        if (!group) {
            throw new exception_1.NotFoundException("Operation failed. Either chat not found, you are not an admin, or the user is not in this group.");
        }
        setImmediate(() => {
            this.handleGroupActionBackground(user, group, [userId], enum_1.GroupActionType.PROMOTE);
        });
        return group;
    }
    async leaveGroup(user, data) {
        const group = await this.ChatRepository.findOne({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(data.chatId), chatType: enum_1.chatTypeEnum.OVM, participants: user._id } });
        if (!group) {
            throw new exception_1.NotFoundException("Operation failed. Either chat not found, or the user is not in this group.");
        }
        if (group.admins?.length) {
            const isAdmin = group.admins.some((adminId) => adminId.toString() === user._id.toString());
            if (isAdmin && group.admins.length === 1 && group.participants.length > 1) {
                throw new exception_1.BadRequestException("You are the only admin left. Please promote another member before leaving.");
            }
        }
        const updateGroup = await this.ChatRepository.updateOne({ filter: { _id: group._id }, update: { $pull: { participants: user._id, admins: user._id } } });
        if (!updateGroup.matchedCount) {
            throw new exception_1.BadRequestException("Fail to leave group");
        }
        setImmediate(() => {
            this.handleGroupActionBackground(user, group, [], enum_1.GroupActionType.LEAVE);
        });
        return `Left group successfully`;
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
