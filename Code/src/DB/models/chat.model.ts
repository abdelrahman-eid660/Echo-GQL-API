import { model, models, Schema, Types } from "mongoose";
import { IChat } from "../../common/interface";
import { chatTypeEnum } from "../../common/enum";

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    chatType: {
      type: String,
      enum: chatTypeEnum,
      default: chatTypeEnum.OVO,
    },
    conversationKey: {
      type: String,
      required: function (this) {
        return this.chatType === chatTypeEnum.OVO;
      },
    },
    groupName: {
      type: String,
      required: function (this) {
        return this.chatType == chatTypeEnum.OVM;
      },
    },
    groupImage: String,
    groupDescription: String,
    admins: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: function (this) {
          return this.chatType == chatTypeEnum.OVM;
        },
      },
    ],
    lastMessageId: {
      type: Types.ObjectId,
      ref: "Message",
    },
    deletedFor: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    strict: true,
    strictQuery: true,
    timestamps: true,
  },
);

chatSchema.index( { conversationKey: 1 }, { unique: true, sparse: true });
chatSchema.index({ participants: 1, updatedAt: -1 });

export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
ChatModel.syncIndexes();
