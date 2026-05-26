import { Types } from "mongoose";
import { availabilityEnum } from "../enum";
import { IReact } from "./react.interface";
import { IUser } from "./user.interface";

export interface IStory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content?: string;
  expiresAt: Date;
  attachments?: {
    image?: string[];
    video?: string[];
  };
  availability: availabilityEnum;
  reactsCount?: number;
  tags?: Types.ObjectId[];
  mentions?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnerStory {
   story: IStory;
   viewsCount: number;
   reacts: IReact[];
   reactsCounts: number;
   viewers? : {viewer : IUser | undefined , viewedAt : string}[] | []
}
export interface ViewerStory {
   story: IStory;
   isViewed: boolean;
}