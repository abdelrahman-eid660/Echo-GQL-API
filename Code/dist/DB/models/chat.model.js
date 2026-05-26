"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const chatSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    chatType: {
        type: String,
        enum: enum_1.chatTypeEnum,
        default: enum_1.chatTypeEnum.OVO,
    },
    conversationKey: {
        type: String,
        required: function () {
            return this.chatType === enum_1.chatTypeEnum.OVO;
        },
    },
    groupName: {
        type: String,
        required: function () {
            return this.chatType == enum_1.chatTypeEnum.OVM;
        },
    },
    groupImage: String,
    groupDescription: String,
    admins: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
            required: function () {
                return this.chatType == enum_1.chatTypeEnum.OVM;
            },
        },
    ],
    lastMessageId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Message",
    },
    deletedFor: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
});
chatSchema.index({ conversationKey: 1 }, { unique: true, sparse: true });
chatSchema.index({ participants: 1, updatedAt: -1 });
exports.ChatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", chatSchema);
exports.ChatModel.syncIndexes();
