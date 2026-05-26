"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typingStatusGQL = exports.removeOrPormotionOrLeaveParticipantGQL = exports.addParticipantsGQL = exports.getMessagesGQL = exports.deleteMessageGQL = exports.getChatGQL = exports.createGroupGQL = exports.sendMessageGQL = void 0;
const zod_1 = __importDefault(require("zod"));
const enum_1 = require("../../common/enum");
const validation_1 = require("../../common/validation");
const mongoose_1 = require("mongoose");
exports.sendMessageGQL = zod_1.default.strictObject({
    chatId: validation_1.generalValidationFields.id.optional(),
    chatType: zod_1.default.enum(enum_1.chatTypeEnum).default(enum_1.chatTypeEnum.OVO),
    receiverId: validation_1.generalValidationFields.id.optional(),
    content: zod_1.default.string().optional(),
    attachments: zod_1.default.array(zod_1.default.string()).optional(),
    mentions: zod_1.default.array(validation_1.generalValidationFields.id).optional(),
    replyTo: validation_1.generalValidationFields.id.optional(),
}).superRefine((args, ctx) => {
    if (!args.chatId && !args.receiverId) {
        ctx.addIssue({
            code: "custom",
            path: ["chatId", "receiverId"],
            message: "Either chatId or receiverId is required",
        });
    }
    if (!args.attachments && !args.content) {
        ctx.addIssue({
            code: "custom",
            path: ["content", "attachments"],
            message: "at least send a content or attchment",
        });
    }
    if (args.mentions?.length) {
        for (const arg of args?.mentions) {
            if (!mongoose_1.Types.ObjectId.isValid(arg)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["mentions"],
                    message: `Invalid Tagged ObjectId ${arg}`,
                });
            }
        }
        const uniqueMentions = [...new Set(args.mentions)];
        if (uniqueMentions.length != args.mentions.length) {
            ctx.addIssue({
                code: "custom",
                path: ["mentions"],
                message: "Dublicated mentions",
            });
        }
    }
});
exports.createGroupGQL = zod_1.default.strictObject({
    participants: zod_1.default.array(validation_1.generalValidationFields.id).min(2),
    chatType: zod_1.default.enum(enum_1.chatTypeEnum).default(enum_1.chatTypeEnum.OVM),
    groupName: zod_1.default.string(),
    groupImage: zod_1.default.string().optional(),
    groupDescription: zod_1.default.string().optional(),
    admins: zod_1.default.array(validation_1.generalValidationFields.id).min(1),
});
exports.getChatGQL = zod_1.default.strictObject({
    limit: zod_1.default.coerce.number().optional(),
    cursor: validation_1.generalValidationFields.id.optional(),
    receiverId: validation_1.generalValidationFields.id.optional(),
    chatId: validation_1.generalValidationFields.id.optional(),
    chatType: zod_1.default.string().optional()
}).superRefine((args, ctx) => {
    if (!args.chatId && !args.receiverId) {
        ctx.addIssue({
            code: "custom",
            path: ["chatId", "receiverId"],
            message: "Either chatId or receiverId is required",
        });
    }
});
exports.deleteMessageGQL = {
    params: zod_1.default.strictObject({
        deletedFor: zod_1.default.array(validation_1.generalValidationFields.id),
    }),
};
exports.getMessagesGQL = zod_1.default.strictObject({
    chatType: zod_1.default.enum(enum_1.chatTypeEnum).default(enum_1.chatTypeEnum.OVO),
    reciverId: validation_1.generalValidationFields.id.optional(),
    chatId: validation_1.generalValidationFields.id.optional(),
}).superRefine((args, ctx) => {
    if (!args.chatId && !args.reciverId) {
        ctx.addIssue({
            code: "custom",
            path: ["chatId", "reciverId"],
            message: "Either chatId or reciverId is required",
        });
    }
    if (args.chatId && args.reciverId) {
        ctx.addIssue({
            code: "custom",
            path: ["chatId", "reciverId"],
            message: "Send only one of chatId or reciverId",
        });
    }
});
exports.addParticipantsGQL = zod_1.default.strictObject({
    chatId: zod_1.default.string(),
    participants: zod_1.default.array(validation_1.generalValidationFields.id).min(1),
});
exports.removeOrPormotionOrLeaveParticipantGQL = zod_1.default.strictObject({
    chatId: zod_1.default.string(),
    userId: validation_1.generalValidationFields.id,
});
exports.typingStatusGQL = zod_1.default.strictObject({
    chatId: zod_1.default.string(),
    isTyping: zod_1.default.boolean(),
});
