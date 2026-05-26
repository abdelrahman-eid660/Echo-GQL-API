import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../enum";
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string; 
  password: string;
  userName?: string;
  DOB: Date;
  phone?: string;
  slug?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  friends? : Types.ObjectId[]
  friendsRequest? : [{
    userId : Types.ObjectId
    status? : StatusEnum
  }]
  confirmedAt: Date;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt: Date;
  updatedAt: Date;
  changeCredentialsTime?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  freezedAt?: Date;
  unfreezedAt?: Date;
}
