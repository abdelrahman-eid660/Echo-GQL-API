"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: "Chat",
    },
    senderId: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: "User",
        index: true,
    },
    content: String,
    attachments: [
        {
            Key: { type: String, required: true },
            fileType: { type: String, required: true },
            fileName: { type: String, required: true }
        },
    ],
    mentions: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    seenBy: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    deliveredTo: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    replyTo: {
        type: mongoose_1.Types.ObjectId,
        ref: "Message",
    },
    deletedAt: Date,
    restoredAt: Date,
    reactsCount: {
        type: Number,
        default: 0
    },
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
});
messageSchema.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
messageSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
    const query = this.getQuery();
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
    }
    else if (update.restoredAt) {
        this.setQuery({ ...query, deletedAt: { $exists: true } });
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
    }
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
messageSchema.index({
    chatId: 1,
    createdAt: -1,
});
exports.MessageModel = mongoose_1.models.Message || (0, mongoose_1.model)("Message", messageSchema);
exports.MessageModel.syncIndexes();
