import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IMessage } from "../../common/interface";
import { BadRequestException } from "../../common/exception";

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    senderId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    content: String,
    attachments: [
      {
        Key: { type: String, required: true },
        fileType: { type: String , required: true },
        fileName: { type: String , required: true }
      },
    ],
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    seenBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    deliveredTo: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: Types.ObjectId,
      ref: "Message",
    },
    deletedAt: Date,
    restoredAt: Date,
    reactsCount : {
      type : Number,
      default : 0
    }, 
  },
  {
    strict: true,
    strictQuery: true,
    timestamps: true,
  },
);
messageSchema.pre(["find", "findOne", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});
messageSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
  const query = this.getQuery();
  const update = this.getUpdate() as HydratedDocument<IMessage>;
  if (update.deletedAt) {
    this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
  } else if (update.restoredAt) {
    this.setQuery({ ...query, deletedAt: { $exists: true } });
    this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
  }
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});
messageSchema.index({
  chatId: 1,
  createdAt: -1,
});
export const MessageModel =
  models.Message || model<IMessage>("Message", messageSchema);
MessageModel.syncIndexes();
