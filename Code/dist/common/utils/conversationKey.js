"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationKey = void 0;
const conversationKey = ({ senderId, reciverId }) => {
    return [senderId, reciverId].sort().join("|");
};
exports.conversationKey = conversationKey;
