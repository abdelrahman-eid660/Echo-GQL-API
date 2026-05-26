"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const exception_1 = require("../../common/exception");
const commentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    postId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Post",
        required: true,
        index: true,
    },
    content: String,
    attachments: {
        type: {
            image: [String],
            video: [String],
        },
        _id: false,
    },
    parentComment: {
        type: mongoose_1.Types.ObjectId,
        ref: "Comment",
        index: true,
    },
    reactsCount: {
        type: Number,
        default: 0
    },
    mentions: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    deletedAt: Date,
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
    optimisticConcurrency: true
});
commentSchema.pre("validate", function () {
    if (!this.content &&
        (!this.attachments ||
            (!this.attachments.image?.length && !this.attachments.video?.length))) {
        throw new exception_1.BadRequestException("Comment must have content or attachments");
    }
});
exports.CommentModel = mongoose_1.models.Comment || (0, mongoose_1.model)("Comment", commentSchema);
exports.CommentModel.syncIndexes();
