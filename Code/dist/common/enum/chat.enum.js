"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupActionType = exports.chatTypeEnum = void 0;
var chatTypeEnum;
(function (chatTypeEnum) {
    chatTypeEnum["OVO"] = "OVO";
    chatTypeEnum["OVM"] = "OVM";
})(chatTypeEnum || (exports.chatTypeEnum = chatTypeEnum = {}));
var GroupActionType;
(function (GroupActionType) {
    GroupActionType["ADD"] = "ADD";
    GroupActionType["REMOVE"] = "REMOVE";
    GroupActionType["PROMOTE"] = "PROMOTE";
    GroupActionType["LEAVE"] = "LEAVE";
})(GroupActionType || (exports.GroupActionType = GroupActionType = {}));
