"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const ReactSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetId: {
        type: mongoose_1.Types.ObjectId,
        refPath: "targetType",
        required: true
    },
    targetType: {
        type: String,
        enum: enum_1.ReactTargetEnum,
        required: true
    },
    type: {
        type: String,
        enum: enum_1.ReactEnum,
        required: true
    }
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
    optimisticConcurrency: true
});
ReactSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
exports.ReactModel = mongoose_1.models.React || (0, mongoose_1.model)("React", ReactSchema);
