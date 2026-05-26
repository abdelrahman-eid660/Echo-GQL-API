"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvents = exports.ChatEvents = void 0;
const chat_service_1 = require("../chat.service");
const validators = __importStar(require("../chat.validation"));
const middleware_1 = require("../../../middleware");
class ChatEvents {
    chatService;
    constructor() {
        this.chatService = chat_service_1.chatService;
    }
    joinChat = (socket, io) => {
        return socket.on("joinRoom", (data) => {
            if (!data.chatId)
                return;
            socket.join(data.chatId);
        });
    };
    sendMessage = (socket, io) => {
        return socket.on("sendMessage", async (data) => {
            try {
                await (0, middleware_1.SocketIOValidation)(validators.sendMessageGQL, data);
                const message = await this.chatService.sendMessage(socket.data.user, data);
                io.to(message.chatId.toString()).emit("newMessage", message);
            }
            catch (error) {
                console.error("Socket Send Message Error:", error);
                const validationIssues = error?.cause?.extensions?.issues || error.issuse || [];
                socket.emit("validation_Error", validationIssues);
            }
        });
    };
    typingStatus = (socket, io) => {
        return socket.on("typing_status", (data) => {
            if (!data.chatId)
                return;
            const userId = socket.data.user._id.toString();
            socket.broadcast.to(data.chatId).emit("user_typing", { userId, ...data });
        });
    };
    addParticipants = (socket, io) => {
        return socket.on("addParticipants", async (data) => {
            try {
                await (0, middleware_1.SocketIOValidation)(validators.addParticipantsGQL, data);
                const chat = await this.chatService.addParticipants(socket.data.user, data);
                const chatId = chat._id.toString();
                io.to(chatId).emit("groupUpdated", {
                    action: "MEMBERS_ADDED",
                    chatId,
                    participants: chat.participants,
                    addedBy: socket.data.user._id
                });
            }
            catch (error) {
                console.error(`Fail to add participant to group Socket Error`, error);
                const validationResult = error?.cause?.extension?.issues || error.issuse || [];
                socket.emit("groupError", { message: error.message, issues: validationResult });
            }
        });
    };
    removeParticipants = (socket, io) => {
        return socket.on("removeParticipants", async (data) => {
            try {
                await (0, middleware_1.SocketIOValidation)(validators.removeOrPormotionOrLeaveParticipantGQL, data);
                const chat = await this.chatService.removeParticipant(socket.data.user, data);
                const chatId = chat._id.toString();
                io.to(chatId).emit("groupUpdated", {
                    action: "MEMBER_REMOVED",
                    chatId,
                    removedUserId: data.userId,
                    participants: chat.participants,
                    removedBy: socket.data.user._id
                });
                const targetUserRoom = io.sockets.adapter.rooms.get(data.userId);
                if (targetUserRoom) {
                    for (const socketId of targetUserRoom) {
                        const targetSocket = io.sockets.sockets.get(socketId);
                        if (targetSocket) {
                            targetSocket.leave(chatId);
                            targetSocket.emit("youWereRemoved", { chatId });
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Fail to remove ${data.userId} from group Socket Error`, error);
                const validationResult = error?.cause?.extension?.issues || error?.issues || [];
                socket.emit("groupError", { message: error.message, issues: validationResult });
            }
        });
    };
    promoteToAdmin = (socekt, io) => {
        return socekt.on("promoteToAdmin", async (data) => {
            try {
                await (0, middleware_1.SocketIOValidation)(validators.removeOrPormotionOrLeaveParticipantGQL, data);
                const chat = await this.chatService.promoteToAdmin(socekt.data.user, data);
                const chatId = chat._id.toString();
                io.to(chatId).emit("groupUpdated", {
                    action: "MEMBER_PROMOTED",
                    chatId,
                    promotedUserId: data.userId,
                    admins: chat.admins,
                });
            }
            catch (error) {
                console.error(`Fail to promoted ${data.userId} To Admin Socket Error`);
                const validationResult = error?.cause?.extension?.issues || error?.issues || [];
                socekt.emit("groupError", { message: error?.message, issues: validationResult });
            }
        });
    };
    leaveGroup = (socket, io) => {
        return socket.on("leaveGroup", async (data) => {
            try {
                await (0, middleware_1.SocketIOValidation)(validators.removeOrPormotionOrLeaveParticipantGQL, data);
                const message = await this.chatService.leaveGroup(socket.data.user, data);
                const chatId = data.chatId;
                io.to(chatId).emit("groupUpdated", {
                    action: "MEMBER_LEFT",
                    chatId,
                    userId: socket.data.user._id,
                });
            }
            catch (error) {
                console.error(`${data.userId} Fail to leave group Socket Error:`, error);
                const validationResult = error?.cause?.extensions?.issues || error?.issues || [];
                socket.emit("groupError", { message: error?.message, issues: validationResult });
            }
        });
    };
}
exports.ChatEvents = ChatEvents;
exports.chatEvents = new ChatEvents();
