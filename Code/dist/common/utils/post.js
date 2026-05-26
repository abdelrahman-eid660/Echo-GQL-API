"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvalibilaty = void 0;
const enum_1 = require("../enum");
const getAvalibilaty = (user) => {
    return [
        { availability: enum_1.availabilityEnum.PUBLIC },
        {
            availability: enum_1.availabilityEnum.ONLYFRIENDS,
            userId: { $in: [...(user?.friends || []), user._id] },
        },
        { availability: enum_1.availabilityEnum.PRIVATE, userId: user?._id },
        { mentions: { $in: [user._id] } },
        { tags: { $in: [user._id] } },
    ];
};
exports.getAvalibilaty = getAvalibilaty;
