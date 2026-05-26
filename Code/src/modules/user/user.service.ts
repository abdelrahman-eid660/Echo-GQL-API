import { attachmentsValidationGQL } from "./user.validation";
import { StatusEnum } from "./../../common/enum/user.enum";
import {
  TokenService,
  tokenService,
  RedisService,
  IGenerateToken,
  S3Service,
  s3Service,
  NotificationService,
  notificationService,
  redisService,
  viewRedisEnum,
} from "./../../common/service";
import {
  CommentRepository,
  NotificationRepository,
  PostRepository,
  ReactRepository,
  StoryRepository,
  UserRepository,
  MessageRepository,
} from "../../DB/Repository";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exception";
import { LogoutEnum, ReactTargetEnum } from "../../common/enum";
import { compareHash, generateHash } from "../../common/utils/security";
import { HydratedDocument, Types } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { ACCESS_EXPIRES_IN } from "../../config/config";
import { IUser } from "../../common/interface/user.interface";
import { ParsedQs } from "qs";
import { TransformToObjectId } from "../../common/utils/ObjectId";
import {
  action_friend_requestGQLDTO,
  attachmentsValidationGQLDTO,
  changePasswordGQLDTO,
  getProfileGQLDTO,
  notificationValidationGQLDTO,
  ReactGQLDTO,
  searchValidationGQLDTO,
} from "./user.dto";
import { getAvalibilaty } from "../../common/utils/post";
import { INotification } from "../../common/interface";

export class UserService {
  private readonly UserRepository: UserRepository;
  private readonly PostRepository: PostRepository;
  private readonly CommentRepository: CommentRepository;
  private readonly ReactRepository: ReactRepository;
  private readonly NotificationRepository: NotificationRepository;
  private readonly StoryRepository: StoryRepository;
  private readonly MessageRepository: MessageRepository;
  private readonly redis: RedisService;
  private readonly tokenService: TokenService;
  private readonly s3: S3Service;
  private readonly notification: NotificationService;
  constructor() {
    this.UserRepository = new UserRepository();
    this.PostRepository = new PostRepository();
    this.CommentRepository = new CommentRepository();
    this.ReactRepository = new ReactRepository();
    this.StoryRepository = new StoryRepository();
    this.NotificationRepository = new NotificationRepository();
    this.MessageRepository = new MessageRepository();
    this.redis = redisService;
    this.tokenService = tokenService;
    this.s3 = s3Service;
    this.notification = notificationService;
  }
  private async handleReactNotification({
    user,
    target,
    targetType,
    recipientId,
    targetId,
  }: {
    user: HydratedDocument<IUser>;
    target: any;
    targetType: string;
    recipientId: Types.ObjectId;
    targetId: string;
  }): Promise<void> {
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
    } catch (error) {
      console.log("React Notification Error:", error);
    }
  }
  private notificationData({
    user,
    targetType,
    target,
  }: {
    user: HydratedDocument<IUser>;
    targetType: string;
    target: HydratedDocument<any>;
  }): { title: string; body: string } {
    let title: string = "";
    let body: string = "";
    switch (targetType) {
      case ReactTargetEnum.POST:
        title = `${user.userName} reacted to your post`;
        body = target?.content?.slice(0, 30) || "Post";
        break;
      case ReactTargetEnum.COMMENT:
        title = `${user.userName} reacted to your comment`;
        body = target?.content?.slice(0, 30) || "Comment";
        break;
      case ReactTargetEnum.STORY:
        title = `${user.userName} reacted to your story`;
        body = "❤️";
        break;
      case ReactTargetEnum.MESSAGE:
        title = `${user.userName} reacted to your message`;
        body = target?.content?.slice(0, 30) || "❤️";
        break;
    }
    return { title, body };
  }
  private getTargetRepository(targetType: ReactTargetEnum) {
    const repositories: any = {
      [ReactTargetEnum.POST]: this.PostRepository,
      [ReactTargetEnum.STORY]: this.StoryRepository,
      [ReactTargetEnum.COMMENT]: this.CommentRepository,
      [ReactTargetEnum.MESSAGE]: this.MessageRepository,
    };
    const repository = repositories[targetType];
    if (!repository) {
      throw new BadRequestException("Invalid target type");
    }
    return repository;
  }
  async isFriendRequestExists({
    user,
    targetUserId,
    status = StatusEnum.PENDDING,
  }: {
    user: HydratedDocument<IUser>;
    targetUserId: Types.ObjectId;
    status?: StatusEnum;
  }): Promise<void | undefined> {
        if (!user?.friendsRequest) return;
        const isExist = user?.friendsRequest.some((req) =>
          String(req.userId) === String(targetUserId) &&
          (status ? req.status === status : true),
        );
        if (isExist) {
          throw new BadRequestException("is actully in your friends request list.");
        } else {
          user.friendsRequest.push({ userId: targetUserId,status: StatusEnum.PENDDING});
          await user.save();
          return;
        }
  }
  async profile(user: HydratedDocument<IUser>,query?: getProfileGQLDTO,): Promise<{user: HydratedDocument<IUser>, viewers?: any , viewersCount?: number}> {
    if (query?.userId) {
      const filter: any = {_id : TransformToObjectId(query.userId as string) ,  confirmedAt: { $exists: true } };
      const User = await this.UserRepository.findOne({
        filter,
        projection: "firstName lastName profileImage coverImage bio DOB",
      });
      if (!User) {
        throw new NotFoundException("No account matching");
      }
      if (User._id.toString() !== user._id.toString()) {
        const targetId = this.redis.View_Key({ viewId: User._id.toString(), type: viewRedisEnum.VIEW });
        await this.redis.addViewer(targetId, user._id.toString(), Date.now());
      }
      return { user: User };
    }
    const User = await this.UserRepository.findOne({
      filter: { _id: user?._id, confirmedAt: { $exists: true } },
      options: { populate: [{ path: "friends", options: { limit: 6 } }] },
    });
    if (!User) {
      throw new NotFoundException("No account matching");
    }
    const targetId = this.redis.View_Key({viewId : User._id.toString() , type : viewRedisEnum.VIEW});
    const viewersCount = await this.redis.viewerCount(targetId);
    const viewers = await this.redis.getViewersWithDate(targetId);
    const formattedViewers = await Promise.all(
      viewers.map(async (v: any) => {
        const user = await this.UserRepository.findById({
          _id: TransformToObjectId(v.value),
          projection: "firstName lastName profileImage",
        });
        return { user, viewedAt: new Date(Number(v.score)).toISOString() };
      }),
    );
    return { user: User, viewersCount: viewersCount,viewers: formattedViewers};
  }
  async search(user: HydratedDocument<IUser>,query: searchValidationGQLDTO): Promise<IUser[]> {
      const searchRegex = new RegExp(query.search.trim(), "i");
      const users = await this.UserRepository.find({filter : {$or : [{firstName : searchRegex },{ lastName : searchRegex}]} , projection : "firstName lastName profileImage"})
      if (!users.length) {
        throw new NotFoundException(`There n't any users contins these letter ${searchRegex} `)
      }
      return users
  }
  async allFriends(user: HydratedDocument<IUser>) {
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
      throw new NotFoundException("No account matching");
    }
    return User;
  }
  async allFriendsRequests(user: HydratedDocument<IUser>) {
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
      throw new NotFoundException("No account matching");
    }
    return User;
  }
  async react(user: HydratedDocument<IUser>, Query: ReactGQLDTO): Promise<any> {
    const { targetId, targetType, type } = Query;
    let target: any;
    const TargetId = TransformToObjectId(targetId as string);
    switch (targetType) {
      case ReactTargetEnum.COMMENT:
        target = await this.CommentRepository.findOne({
          filter: { _id: TargetId },
          projection: "content userId reactsCount",
          options: { lean: true },
        });
        break;
      case ReactTargetEnum.POST:
        target = await this.PostRepository.findOne({
          filter: { _id: TargetId, $or: getAvalibilaty(user) },
          projection: "content userId reactsCount",
          options: { lean: true },
        });
        break;
      case ReactTargetEnum.STORY:
        target = await this.StoryRepository.findOne({
          filter: { _id: TargetId, $or: getAvalibilaty(user) },
          projection: "content userId reactsCount",
          options: { lean: true },
        });
        break;
      case ReactTargetEnum.MESSAGE:
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
        throw new BadRequestException("Invalid targetType");
    }
    if (!target) {
      throw new NotFoundException(`${targetType} not Found`);
    }
    let recipientId: Types.ObjectId;
    switch (targetType) {
      case ReactTargetEnum.POST:
      case ReactTargetEnum.STORY:
      case ReactTargetEnum.COMMENT:
        recipientId = target.userId;
        break;
      case ReactTargetEnum.MESSAGE:
        recipientId = target.senderId._id;
        break;
      default:
        throw new BadRequestException("Invalid notification recipient");
    }
    if (
      targetType === ReactTargetEnum.STORY &&
      target.userId.toString() === user._id.toString()
    ) {
      throw new BadRequestException(
        "you can't react with your story by your account",
      );
    }
    if (
      targetType === ReactTargetEnum.MESSAGE &&
      target.senderId._id.toString() === user._id.toString()
    ) {
      throw new BadRequestException(
        "you can't react with your message by your account",
      );
    }
    const reactTargetExist = await this.ReactRepository.findOne({
      filter: {
        userId: user._id,
        targetId: TargetId,
        targetType: targetType as string,
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
        throw new NotFoundException(`This ${targetType} not exist`);
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
  async getAllNofitications(
    user: HydratedDocument<IUser>,
  ): Promise<HydratedDocument<INotification>[]> {
    const notifications = await this.NotificationRepository.find({
      filter: { recipientId: user._id },
      options: { sort: { createdAt: -1 } },
    });
    if (!notifications.length) {
      throw new NotFoundException("There'nt any Notifications");
    }
    return notifications;
  }
  async readNotifications(
    user: HydratedDocument<IUser>,
    notificationID: notificationValidationGQLDTO,
  ): Promise<{ message: string }> {
    const _id = TransformToObjectId(notificationID as unknown as string);
    const notification = await this.NotificationRepository.updateOne({
      filter: { _id, recipientId: user._id },
      update: { $set: { isRead: true } },
    });
    if (!notification.matchedCount) {
      throw new NotFoundException("This notification not exist or expire");
    }
    return { message: "Done" };
  }
  async addFriend(
    user: HydratedDocument<IUser>,
    { userId }: { userId: string },
  ): Promise<string> {
    const _id = TransformToObjectId(userId as string);
    const userExists = await this.UserRepository.findById({ _id });
    if (!userExists) {
      throw new NotFoundException("This user is not exist");
    }
    await this.isFriendRequestExists({ user, targetUserId: _id });
    await this.isFriendRequestExists({user: userExists,targetUserId: user._id,});
    const tokens = await this.redis.getFCMs(userExists._id);
    if (tokens.length) {
      void  this.notification.sendNotifications({
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
  async actionOfRequestFriend(
    user: HydratedDocument<IUser>,
    data: action_friend_requestGQLDTO,
  ): Promise<string> {
    const { userId, status } = data;
    const _id = TransformToObjectId(userId as string);
    const userExistsInMyList = await this.UserRepository.findOne({
      filter: { _id: user._id, "friendsRequest.userId": _id },
    });
    if (!userExistsInMyList) {
      throw new NotFoundException(
        "This user is not exist in your list friends request",
      );
    }
    switch (status) {
      case StatusEnum.ACCEPT:
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

      case StatusEnum.CANCEL:
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
  async profileImage(
    user: HydratedDocument<IUser>,
    Key: attachmentsValidationGQLDTO,
  ): Promise<HydratedDocument<IUser>> {
    const oldProfileImage = user?.profileImage;
    user.profileImage = Key as unknown as string;
    await user.save();
    if (oldProfileImage) {
      this.s3.deleteAsset({ Key: oldProfileImage });
    }
    return user;
  }
  async coverImage(
    user: HydratedDocument<IUser>,
    Key: attachmentsValidationGQLDTO,
  ): Promise<HydratedDocument<IUser>> {
    const oldCover = user?.coverImage;
    user.coverImage = Key as unknown as string;
    await user.save();
    if (oldCover) {
      await this.s3.deleteAsset({ Key: oldCover });
    }
    return user;
  }
  async updatePassword(
    data: changePasswordGQLDTO,
    user: HydratedDocument<IUser>,
  ): Promise<string> {
    const { oldPassword, newPassword } = data;
    if (!(await compareHash(oldPassword, user.password))) {
      throw new NotFoundException("Invalid Password");
    }
    user.password = newPassword;
    await user.save();
    return "Update Password successfuly";
  }
  async rotateToken(
    user: HydratedDocument<IUser>,
    issure: string,
    decodedToken: JwtPayload,
  ): Promise<IGenerateToken> {
    await this.redis.sadd(
      this.redis.RevokeTokenKey(String(user._id)),
      String(decodedToken.jti),
    );
    const now = Math.floor(Date.now() / 1000);
    const ttl = (decodedToken.exp as number) - now;
    if (now < (decodedToken.iat as number) + ACCESS_EXPIRES_IN) {
      throw new ConflictException("Current access session still valid");
    }
    await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)), ttl);
    return await this.tokenService.createLoginCredentials(user, issure);
  }
  async logout(
    { flag }: { flag: number },
    user: HydratedDocument<IUser>,
    decodedToken: JwtPayload,
  ): Promise<number> {
    let status = 200;
    const now = Math.floor(Date.now() / 1000);

    const tokenExp = decodedToken.exp ? Number(decodedToken.exp) : 0;
    const ttl = tokenExp - now;

    switch (flag) {
      case LogoutEnum.ALL:
        user.changeCredentialsTime = new Date();
        await user.save();
        await this.redis.set({
          key: this.redis.RevokeAllTokenKey(String(user._id)),
          value: now,
        });
        break;

      default:
        // 2. 👈 تأمين الـ TTL: لو التوكن ميت أو فاضل فيه أقل من ثانية، مش هنخزنه أصلاً
        if (ttl > 0) {
          const tokenKey = this.redis.RevokeSingleTokenKey(
            user._id.toString(),
            String(decodedToken.jti),
          );
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
  async freezeUser(Query: ParsedQs): Promise<string> {
    const { userId } = Query;
    const user = await this.UserRepository.findOne({
      filter: { _id: TransformToObjectId(userId as string) },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.freezedAt) {
      throw new ConflictException("User is already frozen");
    }
    const account = await this.UserRepository.updateOne({
      filter: { _id: TransformToObjectId(userId as string) },
      update: { freezedAt: new Date() },
    });
    return "User frozen successfully";
  }
  async unFreezeUser(Query: ParsedQs): Promise<string> {
    const { userId } = Query;
    const user = await this.UserRepository.findOne({
      filter: { _id: TransformToObjectId(userId as string) },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.unfreezedAt) {
      throw new ConflictException("User is already unfrozen");
    }
    const account = await this.UserRepository.updateOne({
      filter: { _id: new Types.ObjectId(userId as string) },
      update: { unfreezedAt: new Date() },
    });
    return "User unfrozen successfully";
  }
  async softDelete(Query: ParsedQs): Promise<string> {
    const { userId } = Query;
    const user = await this.UserRepository.findOne({
      filter: { _id: TransformToObjectId(userId as string) },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.deletedAt) {
      throw new ConflictException("User is already in archive");
    }
    const account = await this.UserRepository.updateOne({
      filter: { _id: TransformToObjectId(userId as string) },
      update: { deletedAt: new Date() },
    });
    return "User add to archive successfuly";
  }
  async restoreUser(Query: ParsedQs): Promise<string> {
    const { userId } = Query;
    const user = await this.UserRepository.findOne({
      filter: { _id: TransformToObjectId(userId as string) , paranoid : false },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.restoredAt) {
      throw new ConflictException("User is already restored");
    }
    await this.UserRepository.updateOne({
      filter: { _id: TransformToObjectId(userId as string), paranoid: false },
      update: { restoredAt: new Date() },
    });
    return "User Restored Successful";
  }
  async hardDelete(user: HydratedDocument<IUser>): Promise<string> {
    const account = await this.UserRepository.deleteOne({
      filter: { _id: user._id, force: true },
    });
    if (!account.deletedCount) {
      throw new NotFoundException("Invalid account");
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
export const userService = new UserService();
