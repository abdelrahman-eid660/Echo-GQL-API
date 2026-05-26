"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentGQLValidation = exports.getAllCommentsGQLValidation = exports.replyCommentGQLVliadation = exports.creatCommentGQLValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const mongoose_1 = require("mongoose");
const validation_1 = require("../../common/validation");
exports.creatCommentGQLValidation = zod_1.default
    .strictObject({
    commentId: validation_1.generalValidationFields.id,
    postId: validation_1.generalValidationFields.id,
    content: zod_1.default.string().optional(),
    attachments: zod_1.default
        .object({ image: zod_1.default.array(zod_1.default.string()), video: zod_1.default.array(zod_1.default.string()) })
        .optional(),
    mentions: zod_1.default.array(zod_1.default.string()).optional(),
})
    .superRefine((args, ctx) => {
    if (!args.attachments && !args.content) {
        ctx.addIssue({
            code: "custom",
            path: ["content"],
            message: "Content is Required",
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
exports.replyCommentGQLVliadation = zod_1.default
    .strictObject({
    commentId: validation_1.generalValidationFields.id,
    postId: validation_1.generalValidationFields.id,
    content: zod_1.default.string().optional(),
    attachments: zod_1.default
        .object({ image: zod_1.default.array(zod_1.default.string()), video: zod_1.default.array(zod_1.default.string()) })
        .optional(),
    mentions: zod_1.default.array(validation_1.generalValidationFields.id).optional(),
})
    .superRefine((args, ctx) => {
    if (!args.attachments && !args.content) {
        ctx.addIssue({
            code: "custom",
            path: ["content"],
            message: "Content is Required",
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
exports.getAllCommentsGQLValidation = zod_1.default.strictObject({
    limit: zod_1.default.coerce.number().optional(),
    cursor: validation_1.generalValidationFields.id.optional(),
    postId: validation_1.generalValidationFields.id,
});
exports.getCommentGQLValidation = zod_1.default.strictObject({
    postId: validation_1.generalValidationFields.id,
    commentId: validation_1.generalValidationFields.id,
});
