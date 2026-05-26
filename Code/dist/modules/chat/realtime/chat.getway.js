"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGetway = exports.ChatGetway = void 0;
const chat_events_1 = require("./chat.events");
class ChatGetway {
    chatEvent;
    constructor() {
        this.chatEvent = chat_events_1.chatEvents;
    }
    registerEvents = (socket, io) => {
        this.chatEvent.joinChat(socket, io);
        this.chatEvent.sendMessage(socket, io);
        this.chatEvent.typingStatus(socket, io);
        this.chatEvent.addParticipants(socket, io);
        this.chatEvent.leaveGroup(socket, io);
        this.chatEvent.removeParticipants(socket, io);
        this.chatEvent.promoteToAdmin(socket, io);
    };
}
exports.ChatGetway = ChatGetway;
exports.chatGetway = new ChatGetway();
