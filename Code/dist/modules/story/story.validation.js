"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoryGQL = exports.getViewerAndReactsStoriesGQL = exports.getUserStoriesGQL = exports.watchStoryGQL = exports.getStoriesGQL = exports.updateStoryGQL = exports.createStoryGQL = void 0;
const zod_1 = __importDefault(require("zod"));
const enum_1 = require("../../common/enum");
const mongoose_1 = require("mongoose");
const validation_1 = require("../../common/validation");
exports.createStoryGQL = zod_1.default.strictObject({
    content: zod_1.default.string().optional(),
    attachments: zod_1.default
        .object({ image: zod_1.default.array(zod_1.default.any()), video: zod_1.default.array(zod_1.default.any()) })
        .optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    mentions: zod_1.default.array(zod_1.default.string()).optional(),
    availability: zod_1.default.coerce.number().default(enum_1.availabilityEnum.PUBLIC)
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
exports.updateStoryGQL = zod_1.default.strictObject({
    storyId: validation_1.generalValidationFields.id,
    mentions: zod_1.default.array(zod_1.default.string()).optional(),
    availability: zod_1.default.coerce.number().default(enum_1.availabilityEnum.PUBLIC),
});
exports.getStoriesGQL = zod_1.default.strictObject({
    cursor: validation_1.generalValidationFields.id.optional(),
    limit: zod_1.default.coerce.number().optional(),
});
exports.watchStoryGQL = zod_1.default.strictObject({
    storyId: validation_1.generalValidationFields.id,
});
exports.getUserStoriesGQL = zod_1.default.strictObject({
    userId: validation_1.generalValidationFields.id,
});
exports.getViewerAndReactsStoriesGQL = zod_1.default.strictObject({
    userId: validation_1.generalValidationFields.id,
    storyId: validation_1.generalValidationFields.id,
});
exports.deleteStoryGQL = zod_1.default.strictObject({
    storyId: validation_1.generalValidationFields.id,
});
