"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatResolver = exports.ChatResolver = void 0;
const middleware_1 = require("../../../middleware");
const chat_service_1 = require("../chat.service");
const chat_validation_1 = require("../chat.validation");
class ChatResolver {
    chatService;
    constructor() {
        this.chatService = chat_service_1.chatService;
    }
    sendMessage = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const message = await this.chatService.sendMessage(user, args);
        return { message };
    };
    getChat = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.getChatGQL, args);
        const { chat, messages, nextCursor } = await this.chatService.getChat(user, args);
        return { chat, messages, nextCursor };
    };
    createGroup = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.createGroupGQL, args);
        const group = await this.chatService.createGroup(user, args);
        return group;
    };
    addParticipants = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.addParticipantsGQL, args);
        const group = await this.chatService.addParticipants(user, args);
        return group;
    };
    removeParticipant = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.removeOrPormotionOrLeaveParticipantGQL, args);
        const group = await this.chatService.removeParticipant(user, args);
        return group;
    };
    promoteToAdmin = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.removeOrPormotionOrLeaveParticipantGQL, args);
        const group = await this.chatService.promoteToAdmin(user, args);
        return group;
    };
    leaveGroup = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(chat_validation_1.removeOrPormotionOrLeaveParticipantGQL, args);
        const message = await this.chatService.leaveGroup(user, args);
        return { message };
    };
}
exports.ChatResolver = ChatResolver;
exports.chatResolver = new ChatResolver();
