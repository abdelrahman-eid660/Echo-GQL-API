"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const PostScehma = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
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
    commentsCount: {
        type: Number,
        default: 0
    },
    availability: {
        type: Number,
        enum: enum_1.availabilityEnum,
        default: enum_1.availabilityEnum.PUBLIC,
    },
    deletedAt: {
        type: Date,
    },
    restoredAt: {
        type: Date,
    },
    freezedAt: {
        type: Date,
    },
    unfreezedAt: {
        type: Date,
    },
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
    optimisticConcurrency: true
});
PostScehma.pre("validate", function () {
    if (!this.content && (!this.attachments || (!this.attachments.image?.length && !this.attachments.video?.length))) {
        throw new exception_1.BadRequestException("Content is Required");
    }
});
PostScehma.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
PostScehma.pre(["updateOne", "findOneAndUpdate"], async function () {
    const update = this.getUpdate();
    const query = this.getQuery();
    const updateManyPosts = exports.PostModel.updateMany.bind(exports.PostModel);
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
        await updateManyPosts({ userId: query._id }, { $set: { deletedAt: new Date(Date.now()) } });
    }
    if (update.restoredAt) {
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        await updateManyPosts({ userId: query._id }, { $set: { restoredAt: new Date(Date.now()) } });
    }
    if (update.freezedAt) {
        this.setUpdate({ ...update, $unset: { unfreezedAt: 1 } });
    }
    if (update.unfreezedAt) {
        this.setQuery({ ...this.getQuery(), freezedAt: { $exists: true } });
        this.setUpdate({ ...update, $unset: { freezedAt: 1 } });
    }
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
PostScehma.pre(["deleteOne", "findOneAndDelete"], async function () {
    const query = this.getQuery();
    const post = await this.model.findOne(query);
    if (!post) {
        throw new exception_1.NotFoundException("Post not found");
    }
    ;
    const force = this.getOptions()?.force;
    if (!post.deletedAt && !force) {
        throw new exception_1.BadRequestException("Post is not soft deleted. Use force delete to permanently remove it.");
    }
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", PostScehma);
exports.PostModel.syncIndexes();
