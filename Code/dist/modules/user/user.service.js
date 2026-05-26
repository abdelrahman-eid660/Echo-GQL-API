"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_enum_1 = require("./../../common/enum/user.enum");
const service_1 = require("./../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/utils/security");
const mongoose_1 = require("mongoose");
const config_1 = require("../../config/config");
const ObjectId_1 = require("../../common/utils/ObjectId");
const post_1 = require("../../common/utils/post");
class UserService {
    UserRepository;
    PostRepository;
    CommentRepository;
    ReactRepository;
    NotificationRepository;
    StoryRepository;
    MessageRepository;
    redis;
    tokenService;
    s3;
    notification;
    constructor() {
        this.UserRepository = new Repository_1.UserRepository();
        this.PostRepository = new Repository_1.PostRepository();
        this.CommentRepository = new Repository_1.CommentRepository();
        this.ReactRepository = new Repository_1.ReactRepository();
        this.StoryRepository = new Repository_1.StoryRepository();
        this.NotificationRepository = new Repository_1.NotificationRepository();
        this.MessageRepository = new Repository_1.MessageRepository();
        this.redis = service_1.redisService;
        this.tokenService = service_1.tokenService;
        this.s3 = service_1.s3Service;
        this.notification = service_1.notificationService;
    }
    async handleReactNotification({ user, target, targetType, recipientId, targetId, }) {
        try {
            const { title, body } = this.notificationData({
                user,
                target,
                targetType,
            });
            await this.NotificationRepository.create({
                data: {
                    senderId: user._id,
                    recipientId,
                    referenceId: targetId,
                    referenceModel: targetType,
                    title,
                    body,
                },
            });
            const tokens = await this.redis.getFCMs(recipientId);
            if (tokens?.length) {
                await this.notification.sendNotifications({
                    tokens,
                    data: { title, body },
                });
            }
        }
        catch (error) {
            console.log("React Notification Error:", error);
        }
    }
    notificationData({ user, targetType, target, }) {
        let title = "";
        let body = "";
        switch (targetType) {
            case enum_1.ReactTargetEnum.POST:
                title = `${user.userName} reacted to your post`;
                body = target?.content?.slice(0, 30) || "Post";
                break;
            case enum_1.ReactTargetEnum.COMMENT:
                title = `${user.userName} reacted to your comment`;
                body = target?.content?.slice(0, 30) || "Comment";
                break;
            case enum_1.ReactTargetEnum.STORY:
                title = `${user.userName} reacted to your story`;
                body = "❤️";
                break;
            case enum_1.ReactTargetEnum.MESSAGE:
                title = `${user.userName} reacted to your message`;
                body = target?.content?.slice(0, 30) || "❤️";
                break;
        }
        return { title, body };
    }
    getTargetRepository(targetType) {
        const repositories = {
            [enum_1.ReactTargetEnum.POST]: this.PostRepository,
            [enum_1.ReactTargetEnum.STORY]: this.StoryRepository,
            [enum_1.ReactTargetEnum.COMMENT]: this.CommentRepository,
            [enum_1.ReactTargetEnum.MESSAGE]: this.MessageRepository,
        };
        const repository = repositories[targetType];
        if (!repository) {
            throw new exception_1.BadRequestException("Invalid target type");
        }
        return repository;
    }
    async isFriendRequestExists({ user, targetUserId, status = user_enum_1.StatusEnum.PENDDING, }) {
        if (!user?.friendsRequest)
            return;
        const isExist = user?.friendsRequest.some((req) => String(req.userId) === String(targetUserId) &&
            (status ? req.status === status : true));
        if (isExist) {
            throw new exception_1.BadRequestException("is actully in your friends request list.");
        }
        else {
            user.friendsRequest.push({ userId: targetUserId, status: user_enum_1.StatusEnum.PENDDING });
            await user.save();
            return;
        }
    }
    async profile(user, query) {
        if (query?.userId) {
            const filter = { _id: (0, ObjectId_1.TransformToObjectId)(query.userId), confirmedAt: { $exists: true } };
            const User = await this.UserRepository.findOne({
                filter,
                projection: "firstName lastName profileImage coverImage bio DOB",
            });
            if (!User) {
                throw new exception_1.NotFoundException("No account matching");
            }
            if (User._id.toString() !== user._id.toString()) {
                const targetId = this.redis.View_Key({ viewId: User._id.toString(), type: service_1.viewRedisEnum.VIEW });
                await this.redis.addViewer(targetId, user._id.toString(), Date.now());
            }
            return { user: User };
        }
        const User = await this.UserRepository.findOne({
            filter: { _id: user?._id, confirmedAt: { $exists: true } },
            options: { populate: [{ path: "friends", options: { limit: 6 } }] },
        });
        if (!User) {
            throw new exception_1.NotFoundException("No account matching");
        }
        const targetId = this.redis.View_Key({ viewId: User._id.toString(), type: service_1.viewRedisEnum.VIEW });
        const viewersCount = await this.redis.viewerCount(targetId);
        const viewers = await this.redis.getViewersWithDate(targetId);
        const formattedViewers = await Promise.all(viewers.map(async (v) => {
            const user = await this.UserRepository.findById({
                _id: (0, ObjectId_1.TransformToObjectId)(v.value),
                projection: "firstName lastName profileImage",
            });
            return { user, viewedAt: new Date(Number(v.score)).toISOString() };
        }));
        return { user: User, viewersCount: viewersCount, viewers: formattedViewers };
    }
    async search(user, query) {
        const searchRegex = new RegExp(query.search.trim(), "i");
        const users = await this.UserRepository.find({ filter: { $or: [{ firstName: searchRegex }, { lastName: searchRegex }] }, projection: "firstName lastName profileImage" });
        if (!users.length) {
            throw new exception_1.NotFoundException(`There n't any users contins these letter ${searchRegex} `);
        }
        return users;
    }
    async allFriends(user) {
        const User = await this.UserRepository.findOne({
            filter: { _id: user._id, confirmedAt: { $exists: true } },
            projection: "friends firstName lastName profileImage",
            options: {
                populate: [
                    { path: "friends", select: "firstName lastName profileImage" },
                ],
            },
        });
        if (!User) {
            throw new exception_1.NotFoundException("No account matching");
        }
        return User;
    }
    async allFriendsRequests(user) {
        const User = await this.UserRepository.findOne({
            filter: { _id: user._id, confirmedAt: { $exists: true } },
            projection: "friendsRequest firstName lastName profileImage",
            options: {
                populate: [
                    { path: "friendsRequest.userId", select: "firstName lastName profileImage" },
                ],
            },
        });
        if (!User) {
            throw new exception_1.NotFoundException("No account matching");
        }
        return User;
    }
    async react(user, Query) {
        const { targetId, targetType, type } = Query;
        let target;
        const TargetId = (0, ObjectId_1.TransformToObjectId)(targetId);
        switch (targetType) {
            case enum_1.ReactTargetEnum.COMMENT:
                target = await this.CommentRepository.findOne({
                    filter: { _id: TargetId },
                    projection: "content userId reactsCount",
                    options: { lean: true },
                });
                break;
            case enum_1.ReactTargetEnum.POST:
                target = await this.PostRepository.findOne({
                    filter: { _id: TargetId, $or: (0, post_1.getAvalibilaty)(user) },
                    projection: "content userId reactsCount",
                    options: { lean: true },
                });
                break;
            case enum_1.ReactTargetEnum.STORY:
                target = await this.StoryRepository.findOne({
                    filter: { _id: TargetId, $or: (0, post_1.getAvalibilaty)(user) },
                    projection: "content userId reactsCount",
                    options: { lean: true },
                });
                break;
            case enum_1.ReactTargetEnum.MESSAGE:
                target = await this.MessageRepository.findOne({
                    filter: { _id: TargetId },
                    options: {
                        populate: [
                            { path: "senderId", select: "firstName lastName profileImage" },
                            {
                                path: "chatId",
                                select: "participants chatType groupName groupImage",
                            },
                        ],
                    },
                });
                break;
            default:
                throw new exception_1.BadRequestException("Invalid targetType");
        }
        if (!target) {
            throw new exception_1.NotFoundException(`${targetType} not Found`);
        }
        let recipientId;
        switch (targetType) {
            case enum_1.ReactTargetEnum.POST:
            case enum_1.ReactTargetEnum.STORY:
            case enum_1.ReactTargetEnum.COMMENT:
                recipientId = target.userId;
                break;
            case enum_1.ReactTargetEnum.MESSAGE:
                recipientId = target.senderId._id;
                break;
            default:
                throw new exception_1.BadRequestException("Invalid notification recipient");
        }
        if (targetType === enum_1.ReactTargetEnum.STORY &&
            target.userId.toString() === user._id.toString()) {
            throw new exception_1.BadRequestException("you can't react with your story by your account");
        }
        if (targetType === enum_1.ReactTargetEnum.MESSAGE &&
            target.senderId._id.toString() === user._id.toString()) {
            throw new exception_1.BadRequestException("you can't react with your message by your account");
        }
        const reactTargetExist = await this.ReactRepository.findOne({
            filter: {
                userId: user._id,
                targetId: TargetId,
                targetType: targetType,
            },
        });
        if (!reactTargetExist) {
            const React = await this.ReactRepository.create({
                data: { userId: user._id, targetId: TargetId, targetType, type },
            });
            void this.handleReactNotification({
                user,
                target,
                targetType,
                recipientId,
                targetId,
            });
            const repository = this.getTargetRepository(targetType);
            await repository.findOneAndUpdate({
                filter: { _id: TargetId },
                update: { $inc: { reactsCount: 1 } },
            });
            return React;
        }
        if (reactTargetExist.type === type) {
            const removeReact = await this.ReactRepository.deleteOne({
                filter: { _id: reactTargetExist._id },
            });
            const repository = this.getTargetRepository(targetType);
            await repository.findOneAndUpdate({
                filter: { _id: TargetId },
                update: { $inc: { reactsCount: -1 } },
            });
            if (!removeReact.deletedCount) {
                throw new exception_1.NotFoundException(`This ${targetType} not exist`);
            }
            return { message: "Done" };
        }
        const updatedReact = await this.ReactRepository.findOneAndUpdate({
            filter: { _id: reactTargetExist._id },
            update: { $set: { type } },
            options: { new: true },
        });
        return updatedReact;
    }
    async getAllNofitications(user) {
        const notifications = await this.NotificationRepository.find({
            filter: { recipientId: user._id },
            options: { sort: { createdAt: -1 } },
        });
        if (!notifications.length) {
            throw new exception_1.NotFoundException("There'nt any Notifications");
        }
        return notifications;
    }
    async readNotifications(user, notificationID) {
        const _id = (0, ObjectId_1.TransformToObjectId)(notificationID);
        const notification = await this.NotificationRepository.updateOne({
            filter: { _id, recipientId: user._id },
            update: { $set: { isRead: true } },
        });
        if (!notification.matchedCount) {
            throw new exception_1.NotFoundException("This notification not exist or expire");
        }
        return { message: "Done" };
    }
    async addFriend(user, { userId }) {
        const _id = (0, ObjectId_1.TransformToObjectId)(userId);
        const userExists = await this.UserRepository.findById({ _id });
        if (!userExists) {
            throw new exception_1.NotFoundException("This user is not exist");
        }
        await this.isFriendRequestExists({ user, targetUserId: _id });
        await this.isFriendRequestExists({ user: userExists, targetUserId: user._id, });
        const tokens = await this.redis.getFCMs(userExists._id);
        if (tokens.length) {
            void this.notification.sendNotifications({
                tokens,
                data: {
                    title: "Friend Request",
                    body: `${user.userName} sent you a friend request`,
                    extra: { userId: user._id.toString() },
                },
            });
        }
        return "Send Request Successfuly";
    }
    async actionOfRequestFriend(user, data) {
        const { userId, status } = data;
        const _id = (0, ObjectId_1.TransformToObjectId)(userId);
        const userExistsInMyList = await this.UserRepository.findOne({
            filter: { _id: user._id, "friendsRequest.userId": _id },
        });
        if (!userExistsInMyList) {
            throw new exception_1.NotFoundException("This user is not exist in your list friends request");
        }
        switch (status) {
            case user_enum_1.StatusEnum.ACCEPT:
                await Promise.all([
                    this.UserRepository.updateOne({
                        filter: { _id: user._id },
                        update: {
                            $pull: { friendsRequest: { userId: _id } },
                            $addToSet: { friends: _id },
                        },
                    }),
                    this.UserRepository.updateOne({
                        filter: { _id },
                        update: {
                            $pull: { friendsRequest: { userId: user._id } },
                            $addToSet: { friends: user._id },
                        },
                    }),
                ]);
                break;
            case user_enum_1.StatusEnum.CANCEL:
                await Promise.all([
                    this.UserRepository.updateOne({
                        filter: { _id: user._id },
                        update: {
                            $pull: { friendsRequest: { userId: _id } },
                        },
                    }),
                    this.UserRepository.updateOne({
                        filter: { _id },
                        update: {
                            $pull: { friendsRequest: { userId: user._id } },
                        },
                    }),
                ]);
                break;
        }
        return `${status} Successfuly`;
    }
    async profileImage(user, Key) {
        const oldProfileImage = user?.profileImage;
        user.profileImage = Key;
        await user.save();
        if (oldProfileImage) {
            this.s3.deleteAsset({ Key: oldProfileImage });
        }
        return user;
    }
    async coverImage(user, Key) {
        const oldCover = user?.coverImage;
        user.coverImage = Key;
        await user.save();
        if (oldCover) {
            await this.s3.deleteAsset({ Key: oldCover });
        }
        return user;
    }
    async updatePassword(data, user) {
        const { oldPassword, newPassword } = data;
        if (!(await (0, security_1.compareHash)(oldPassword, user.password))) {
            throw new exception_1.NotFoundException("Invalid Password");
        }
        user.password = newPassword;
        await user.save();
        return "Update Password successfuly";
    }
    async rotateToken(user, issure, decodedToken) {
        await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)), String(decodedToken.jti));
        const now = Math.floor(Date.now() / 1000);
        const ttl = decodedToken.exp - now;
        if (now < decodedToken.iat + config_1.ACCESS_EXPIRES_IN) {
            throw new exception_1.ConflictException("Current access session still valid");
        }
        await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)), ttl);
        return await this.tokenService.createLoginCredentials(user, issure);
    }
    async logout({ flag }, user, decodedToken) {
        let status = 200;
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = decodedToken.exp ? Number(decodedToken.exp) : 0;
        const ttl = tokenExp - now;
        switch (flag) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.set({
                    key: this.redis.RevokeAllTokenKey(String(user._id)),
                    value: now,
                });
                break;
            default:
                if (ttl > 0) {
                    const tokenKey = this.redis.RevokeSingleTokenKey(user._id.toString(), String(decodedToken.jti));
                    await this.redis.set({
                        key: tokenKey,
                        value: "revoked",
                        ttl: ttl,
                    });
                }
                status = 201;
                break;
        }
        return status;
    }
    async freezeUser(Query) {
        const { userId } = Query;
        const user = await this.UserRepository.findOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId) },
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.freezedAt) {
            throw new exception_1.ConflictException("User is already frozen");
        }
        const account = await this.UserRepository.updateOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId) },
            update: { freezedAt: new Date() },
        });
        return "User frozen successfully";
    }
    async unFreezeUser(Query) {
        const { userId } = Query;
        const user = await this.UserRepository.findOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId) },
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.unfreezedAt) {
            throw new exception_1.ConflictException("User is already unfrozen");
        }
        const account = await this.UserRepository.updateOne({
            filter: { _id: new mongoose_1.Types.ObjectId(userId) },
            update: { unfreezedAt: new Date() },
        });
        return "User unfrozen successfully";
    }
    async softDelete(Query) {
        const { userId } = Query;
        const user = await this.UserRepository.findOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId) },
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.deletedAt) {
            throw new exception_1.ConflictException("User is already in archive");
        }
        const account = await this.UserRepository.updateOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId) },
            update: { deletedAt: new Date() },
        });
        return "User add to archive successfuly";
    }
    async restoreUser(Query) {
        const { userId } = Query;
        const user = await this.UserRepository.findOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId), paranoid: false },
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.restoredAt) {
            throw new exception_1.ConflictException("User is already restored");
        }
        await this.UserRepository.updateOne({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(userId), paranoid: false },
            update: { restoredAt: new Date() },
        });
        return "User Restored Successful";
    }
    async hardDelete(user) {
        const account = await this.UserRepository.deleteOne({
            filter: { _id: user._id, force: true },
        });
        if (!account.deletedCount) {
            throw new exception_1.NotFoundException("Invalid account");
        }
        await this.s3.deleteFolderByPreifx({
            Prefix: `users/${user._id.toString()}`,
        });
        await this.s3.deleteFolderByPreifx({
            Prefix: `posts/${user._id.toString()}`,
        });
        return "User Deleted Successful";
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
