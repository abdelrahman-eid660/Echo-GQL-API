"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const StoryScehma = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        index: true,
    },
    content: {
        type: String,
        required: function () {
            !this.attachments;
        },
    },
    attachments: {
        _id: false,
        image: [String],
        video: [String],
    },
    tags: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    mentions: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    reactsCount: {
        type: Number,
        default: 0
    },
    availability: {
        type: Number,
        enum: enum_1.availabilityEnum,
        default: enum_1.availabilityEnum.PUBLIC,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
    optimisticConcurrency: true
});
StoryScehma.pre("validate", function () {
    if (!this.content &&
        (!this.attachments ||
            (!this.attachments.image?.length && !this.attachments.video?.length))) {
        throw new exception_1.BadRequestException("Content is Required");
    }
});
StoryScehma.index({ expiresAt: 1 });
StoryScehma.index({ createdAt: -1, userId: 1 });
exports.StoryModel = mongoose_1.models.Story || (0, mongoose_1.model)("Story", StoryScehma);
exports.StoryModel.syncIndexes();
