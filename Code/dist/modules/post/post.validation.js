"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsGQL = exports.deletePost = exports.updatePost = exports.creatPost = void 0;
const zod_1 = __importDefault(require("zod"));
const enum_1 = require("../../common/enum");
const mongoose_1 = require("mongoose");
const validation_1 = require("../../common/validation");
exports.creatPost = zod_1.default
    .strictObject({
    content: zod_1.default.string().optional(),
    attachments: zod_1.default
        .object({ image: zod_1.default.array(zod_1.default.any()), video: zod_1.default.array(zod_1.default.any()) })
        .optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    mentions: zod_1.default.array(zod_1.default.string()).optional(),
    availability: zod_1.default.coerce.number().default(enum_1.availabilityEnum.PUBLIC),
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
exports.updatePost = zod_1.default
    .strictObject({
    content: zod_1.default.string().trim().optional(),
    attachments: zod_1.default
        .object({ image: zod_1.default.array(zod_1.default.any()), video: zod_1.default.array(zod_1.default.any()) })
        .optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    mentions: zod_1.default.array(zod_1.default.string()).optional(),
    availability: zod_1.default.coerce.number().default(enum_1.availabilityEnum.PUBLIC),
})
    .superRefine((args, ctx) => {
    if (!Object.values(args).length) {
        ctx.addIssue({
            code: "custom",
            message: "Can't accept all fields to be empty",
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
exports.deletePost = zod_1.default.strictObject({
    postId: validation_1.generalValidationFields.id,
    force: zod_1.default.boolean().optional().default(false),
});
exports.getPostsGQL = zod_1.default.strictObject({
    cursor: validation_1.generalValidationFields.id.optional(),
    limit: zod_1.default.coerce.number().optional(),
});
