"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const chat_service_1 = require("./chat.service");
const response_1 = require("../../common/response");
const enum_1 = require("../../common/enum");
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/send-message", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chat = await chat_service_1.chatService.sendMessage(req.user, req.body);
    (0, response_1.successResponse)({ res, status: 201, data: chat });
});
router.get("/get-chat", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chat = await chat_service_1.chatService.getChat(req.user, req.params.reciverId, req.query);
    (0, response_1.successResponse)({ res, status: 201, data: chat });
});
router.get("/group/:groupId", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chat = await chat_service_1.chatService.getGroupChat(req.user, req.params.groupId, req.query);
    (0, response_1.successResponse)({ res, status: 201, data: chat });
});
router.post("/create-group", (0, multer_1.CloudFileUpload)({ storageApproach: enum_1.StorageApproachEnum.DISK, validation: multer_1.fieldValidation.image, maxSize: 12 }).single("groupImage"), (0, middleware_1.authentication)(), async (req, res, next) => {
    const group = await chat_service_1.chatService.createGroupChat(req.user, req.body, req.file);
    (0, response_1.successResponse)({ res, status: 201, data: group });
});
router.get("/get-chats", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chats = await chat_service_1.chatService.getAllChats(req.user);
    (0, response_1.successResponse)({ res, status: 201, data: chats });
});
exports.default = router;
