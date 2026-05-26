"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const NotificationScehma = new mongoose_1.Schema({
    senderId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    recipientId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String || {},
        required: true
    },
    referenceId: {
        type: mongoose_1.Types.ObjectId,
        refPath: "referenceModel"
    },
    referenceModel: {
        type: String,
        enum: enum_1.notificationModelEnum,
        default: enum_1.notificationModelEnum.USER
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
    optimisticConcurrency: true
});
NotificationScehma.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationScehma.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 * 1000 });
exports.NotificationModel = mongoose_1.models.Notification || (0, mongoose_1.model)("Notification", NotificationScehma);
