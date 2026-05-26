import {
  RedisService,
  redisService,
  S3Service,
  s3Service,
  NotificationService,
  notificationService,
} from "./../../common/service";
import { HydratedDocument } from "mongoose";
import { IChat, IMessage, IUser } from "../../common/interface";
import {
  ChatRepository,
  MessageRepository,
  UserRepository,
  NotificationRepository,
} from "../../DB/Repository";
import { conversationKey } from "../../common/utils/conversationKey";
import { chatTypeEnum, GroupActionType, notificationModelEnum } from "../../common/enum";
import { BadRequestException, NotFoundException } from "../../common/exception";
import { addParticipantsGQLDTO, createGroupGQLDTO, getChatGQLDTO, removeOrPormotionOrLeaveParticipantGQLDTO, sendMessageGQLDTO } from "./chat.dto";
import { TransformToObjectId } from "../../common/utils/ObjectId";
export class ChatService {
  private ChatRepository: ChatRepository;
  private UserRepository: UserRepository;
  private MessageRepository: MessageRepository;
  private NotificationRepository: NotificationRepository;
  private redis: RedisService;
  private s3: S3Service;
  private notificationService: NotificationService;
  constructor() {
    this.ChatRepository = new ChatRepository();
    this.UserRepository = new UserRepository();
    this.MessageRepository = new MessageRepository();
    this.NotificationRepository = new NotificationRepository();
    this.redis = redisService;
    this.s3 = s3Service;
    this.notificationService = notificationService;
  }
  private async sendNotification(user : HydratedDocument<IUser>  , data : any):Promise<void> {    
        try {
          if (data?.participants?.length) {
            const tokens = await this.redis.getFCMsMulti(data.participants) as unknown as string[]
            if (tokens.length) {
              await this.notificationService.sendNotifications({tokens , data : {title : `${user.userName} add you to his group` , body : "✅"}})
              await this.NotificationRepository.create({data : {senderId : user._id , body : data.content || "✅" , title : `${user.userName} add new participant to group` , recipientId : data.reciverId , referenceId : data._id , referenceModel : notificationModelEnum.CHAT  }}) 
            }
          }
        } catch(err) {
            console.error(err)
            throw new BadRequestException(`Fail to send Notification`, {error : err})
        }
  }
  private async handleGroupActionBackground(actor: HydratedDocument<IUser>,group: IChat,targetUserIds: string[],   action: GroupActionType):Promise<void> {
    try {
      const actorIdStr = actor._id.toString();
      const currentParticipants = group.participants.map(id => id.toString());
      let allPossibleRecipients: string[] = [];
      if (action === GroupActionType.ADD) {
        const combined = [...currentParticipants, ...targetUserIds];
        allPossibleRecipients = Array.from(new Set(combined)).filter(recipientId => recipientId !== actorIdStr);
      } else {
        allPossibleRecipients = currentParticipants.filter(recipientId => recipientId !== actorIdStr);
      }
      if (allPossibleRecipients.length === 0) return;
      const notificationRecords: any[] = [];
      for (const recipientId of allPossibleRecipients) {
        let pushBody = "";
        let dbBody = "";
        let dbTitle = "Group Update";
        const isTarget = targetUserIds.includes(recipientId);
        switch (action) {
          case GroupActionType.ADD:
            if (isTarget) {
              pushBody = `${actor.userName} added you to the group`;
              dbBody = `You were added to ${group.groupName || 'the group'}`;
            } else {
              pushBody = `${actor.userName} added new members to ${group.groupName || 'the group'}`;
              dbBody = `${actor.userName} added new members to the group`;
            }
            break;
          case GroupActionType.REMOVE:
            if (isTarget) {
              pushBody = `You have been removed from the group by ${actor.userName}`;
              dbBody = `You were removed from ${group.groupName || 'the group'}`;
            } else {
              pushBody = `${actor.userName} removed a member from ${group.groupName || 'the group'}`;
              dbBody = `A member was removed from the group`;
            }
            break;
          case GroupActionType.PROMOTE:
            if (isTarget) {
              pushBody = `You have been promoted to Admin by ${actor.userName}`;
              dbBody = `You were promoted to Admin in ${group.groupName || 'the group'}`;
            } else {
              pushBody = `${actor.userName} promoted a member to Admin in ${group.groupName || 'the group'}`;
              dbBody = `A member was promoted to Admin`;
            }
            break;
          case GroupActionType.LEAVE:
            if (!isTarget) {
              pushBody = `${actor.userName} left the group`;
              dbBody = `${actor.userName} left ${group.groupName || 'the group'}`;
              dbTitle = "Member Left";
            } else {
              continue; 
            } 
            break;
        }
        const token = await this.redis.getFCMsMulti([recipientId]) as unknown as string[];
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
          recipientId: TransformToObjectId(recipientId),
         referenceId: group._id,
          referenceModel: "Chat"
       });
      }
      if (notificationRecords.length > 0) {
        await this.NotificationRepository.create({ data: notificationRecords });
      }
    } catch (error) {
      console.error(`⚡ Error in background task for group action [${action}]:`, error);
    }
  }
  async sendMessage(user: HydratedDocument<IUser>, data: sendMessageGQLDTO):Promise<IMessage> {
    let chatId : any = data.chatId;
    if (!chatId) {
    const key = conversationKey({ senderId: user._id, reciverId: data.receiverId });
    let chat = await this.ChatRepository.findOne({
      filter: { conversationKey: key },
      options: { lean: true }
    });
    if (!chat) {
      chat = await this.ChatRepository.create({
        data: {
          chatType: data.chatType || chatTypeEnum.OVO,
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
      throw new BadRequestException("Message creation failed");
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
  async getChat(user: HydratedDocument<IUser>, query: getChatGQLDTO) : Promise<{ chat : IChat, messages: IMessage[], nextCursor : Date | null | undefined }> {
    const { limit, cursor, receiverId , chatId } = query;
    let chat : any;
    if (chatId) {
        chat = await this.ChatRepository.findOne({filter: { _id : TransformToObjectId(chatId) },
        options: {lean: true, populate: [{ path: "participants", select: "firstName lastName profileImage" }]}
    });
    }else if(receiverId){
      const key = conversationKey({ senderId: user._id,reciverId: receiverId });
      chat = await this.ChatRepository.findOne({ filter: { conversationKey: key },
      options: {lean: true, populate: [{ path: "participants", select: "firstName lastName profileImage" }]}
    });
    }
    if (!chat) {
      throw new NotFoundException("Chat not found");
    }
    let filter: any = { chatId: chat._id };
    if (cursor) {
      filter.createdAt = { $lt: cursor };
    }  
    const messages = await this.MessageRepository.find({filter,options: { lean: true,sort: { createdAt: -1 },limit: Number(limit) || 6}});
    const nextCursor = messages.length ? messages[messages.length - 1]?.createdAt : null;
    return { chat, messages: messages, nextCursor };
  }
  async createGroup(user: HydratedDocument<IUser>, data: createGroupGQLDTO):Promise<IChat> {
    const {  participants , admins } = data
    const allUserIds = [...new Set([...participants, ...admins])]; 
    const usersExists = await this.UserRepository.find({filter : {_id : {$in : allUserIds}}})    
    if (!usersExists.length) {
      throw new NotFoundException("Fail to find some users")
    }
   const group =  await this.ChatRepository.create({data})
   return group
  }
  async addParticipants (user : HydratedDocument<IUser> , data : addParticipantsGQLDTO):Promise<IChat>{
    const {chatId , participants}  = data
    const newParticipantIds = participants.map(id=>id.toString()).filter(id => id !== user._id.toString())
    if (newParticipantIds.length === 0) {
      throw new BadRequestException("No valid new participants provided");
    }
    const existingUsers = await this.UserRepository.find({ filter: { _id: { $in: newParticipantIds } } , options : {lean : true } , projection : "_id"});
    if (existingUsers.length !== newParticipantIds.length) {
      throw new NotFoundException("Some users do not exist in the system");
    }
    const group = await this.ChatRepository.findOneAndUpdate({filter : {_id : TransformToObjectId(chatId) , admins :  user._id , chatType : chatTypeEnum.OVM} , update : {$addToSet : {participants : {$each : participants}}} , options : {lean : true , new : true}})
    if (!group) {
      throw new NotFoundException("Chat not found or you are not an admin of this group");
    }
    setImmediate(() => {
      this.handleGroupActionBackground(user, group, newParticipantIds || [], GroupActionType.ADD);
    });
    return group
  }
  async removeParticipant (user : HydratedDocument<IUser> , data : removeOrPormotionOrLeaveParticipantGQLDTO):Promise<IChat>{
    const {chatId , userId}  = data
    if (user._id.toString() === userId) {
      throw new BadRequestException("You cannot remove yourself from the group. Use leaveGroup instead.");
    }
    const existingUser = await this.UserRepository.findOne({ filter: { _id : userId }});
    if (!existingUser) {
      throw new NotFoundException("This user not exist");
    }
    const group = await this.ChatRepository.findOneAndUpdate({filter : {_id : chatId , admins :  user._id , chatType : chatTypeEnum.OVM} , update : {$pull : {participants : TransformToObjectId(userId) , admins : TransformToObjectId(userId)}} , options : {lean : true , new : true}})
    if (!group) {
      throw new NotFoundException("Operation failed. Either chat not found, you are not an admin, or the user is not in this group.")
    }
    setImmediate(() => {
      this.handleGroupActionBackground(user, group, [userId], GroupActionType.REMOVE);
    });
    return group;
  }
  async promoteToAdmin (user : HydratedDocument<IUser> , data : removeOrPormotionOrLeaveParticipantGQLDTO):Promise<IChat>{
    const {chatId , userId}  = data
    if (user._id.toString() === userId) {
      throw new BadRequestException("You cannot promote yourself.");
    }
    const existingUser = await this.UserRepository.findOne({ filter: { _id : userId }});
    if (!existingUser) {
      throw new NotFoundException("This user not exist");
    }
    const group = await this.ChatRepository.findOneAndUpdate({filter : {_id : chatId , admins :  user._id , chatType : chatTypeEnum.OVM , participants : TransformToObjectId(userId)} , update : {$addToSet : {admins : TransformToObjectId(userId) }} , options : {lean : true , new : true}})
    if (!group) {
      throw new NotFoundException("Operation failed. Either chat not found, you are not an admin, or the user is not in this group.")
    }
    setImmediate(() => {
      this.handleGroupActionBackground(user, group, [userId], GroupActionType.PROMOTE);
    });
    return group;
  }
  async leaveGroup (user : HydratedDocument<IUser> , data : removeOrPormotionOrLeaveParticipantGQLDTO):Promise<string>{
    const group = await this.ChatRepository.findOne({filter : {_id : TransformToObjectId(data.chatId) , chatType : chatTypeEnum.OVM , participants : user._id}})
    if (!group) {
      throw new NotFoundException("Operation failed. Either chat not found, or the user is not in this group.")
    }
    if (group.admins?.length) {
      const isAdmin = group.admins.some((adminId: any) => adminId.toString() === user._id.toString());
      if (isAdmin && group.admins.length === 1 && group.participants.length > 1) {
        throw new BadRequestException("You are the only admin left. Please promote another member before leaving.");
      }
    }
    const updateGroup = await this.ChatRepository.updateOne({filter : {_id : group._id} , update : {$pull :{participants : user._id , admins : user._id}}})
    if (!updateGroup.matchedCount) {
      throw new BadRequestException("Fail to leave group")
    }
    setImmediate(() => {
      this.handleGroupActionBackground(user, group, [], GroupActionType.LEAVE);
    });
    return `Left group successfully`;
  }
}
export const chatService = new ChatService();
