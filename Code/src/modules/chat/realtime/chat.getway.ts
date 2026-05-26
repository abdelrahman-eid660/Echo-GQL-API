import { Server } from 'socket.io';
import { ISocket } from '../../../common/types';
import { chatEvents, ChatEvents } from './chat.events';
export class ChatGetway {
    private chatEvent : ChatEvents
    constructor(){
        this.chatEvent = chatEvents
    }
    registerEvents = (socket : ISocket , io : Server)=>{
        this.chatEvent.joinChat(socket , io)
        this.chatEvent.sendMessage(socket , io)
        this.chatEvent.typingStatus(socket , io)
        this.chatEvent.addParticipants(socket , io)
        this.chatEvent.leaveGroup(socket , io)
        this.chatEvent.removeParticipants(socket , io)
        this.chatEvent.promoteToAdmin(socket , io)
    }
}
export const chatGetway = new ChatGetway()