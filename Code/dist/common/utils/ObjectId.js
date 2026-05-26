"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformToObjectId = void 0;
const mongoose_1 = require("mongoose");
const TransformToObjectId = (id) => {
    return mongoose_1.Types.ObjectId.createFromHexString(id);
};
exports.TransformToObjectId = TransformToObjectId;
