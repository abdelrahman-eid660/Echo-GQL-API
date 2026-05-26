import { Types } from "mongoose";
import { chatTypeEnum } from "../enum";
import { IUser } from "./user.interface";

export interface IChat {
  _id: Types.ObjectId;

  participants: Types.ObjectId[] | IUser[];

  chatType: chatTypeEnum;

  conversationKey : string

  groupName?: string;

  groupImage?: string;
  
  groupDescription?: string;

  lastMessageId?: Types.ObjectId;

  admins?: Types.ObjectId[] | IUser[];

  deletedFor?: Types.ObjectId[] | IUser[];

  createdAt: Date;

  updatedAt?: Date;
}
