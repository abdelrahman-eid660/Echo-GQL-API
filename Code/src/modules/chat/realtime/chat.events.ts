import { Server } from 'socket.io';
import { ISocket } from '../../../common/types';
import { chatService, ChatService } from '../chat.service';
import * as validators from '../chat.validation'
import { SocketIOValidation } from '../../../middleware';
import { addParticipantsGQLDTO, removeOrPormotionOrLeaveParticipantGQLDTO, sendMessageGQLDTO, typingStatusGQLDTO } from '../chat.dto';
export class ChatEvents {
    private chatService : ChatService
    constructor(){
        this.chatService = chatService
    }
    joinChat = (socket : ISocket , io : Server)=>{
        return socket.on("joinRoom" , (data : {chatId : string})=>{
            if(!data.chatId) return
            socket.join(data.chatId)
        })  
    }
    sendMessage = (socket : ISocket , io : Server)=>{
        return socket.on("sendMessage" ,async (data : sendMessageGQLDTO)=>{
            try {                
                await SocketIOValidation(validators.sendMessageGQL , data)
                const message = await this.chatService.sendMessage(socket.data.user , data)                
                io.to(message.chatId.toString()).emit("newMessage" , message )
            } catch (error : any) {
                console.error("Socket Send Message Error:", error);
                const validationIssues = error?.cause?.extensions?.issues || error.issuse || []
                socket.emit("validation_Error" , validationIssues)
            }
        })
    }
    typingStatus = (socket : ISocket , io : Server)=>{
        return socket.on("typing_status" , (data : typingStatusGQLDTO)=>{
            if (!data.chatId) return
            const userId = socket.data.user._id.toString()
            socket.broadcast.to(data.chatId).emit("user_typing" , {userId , ...data})
        })
    }
    addParticipants = (socket : ISocket , io : Server)=>{
        return socket.on("addParticipants" , async (data : addParticipantsGQLDTO)=>{
            try {
                await SocketIOValidation(validators.addParticipantsGQL , data)
                const chat = await this.chatService.addParticipants(socket.data.user , data)
                const chatId = chat._id.toString()                
                io.to(chatId).emit("groupUpdated" , {
                    action : "MEMBERS_ADDED",
                    chatId,
                    participants : chat.participants,
                    addedBy : socket.data.user._id
                })
            } catch (error : any) {
                console.error(`Fail to add participant to group Socket Error` , error)
                const validationResult = error?.cause?.extension?.issues || error.issuse || []
                socket.emit("groupError" , {message : error.message , issues : validationResult})
            }
        })
    }
    removeParticipants = (socket : ISocket , io : Server)=>{
        return socket.on("removeParticipants" , async(data : removeOrPormotionOrLeaveParticipantGQLDTO)=>{
            try {
                await SocketIOValidation(validators.removeOrPormotionOrLeaveParticipantGQL , data)
                const chat = await this.chatService.removeParticipant(socket.data.user , data)
                const chatId = chat._id.toString()
                io.to(chatId).emit("groupUpdated",{
                    action : "MEMBER_REMOVED",
                    chatId,
                    removedUserId : data.userId,
                    participants : chat.participants,
                    removedBy : socket.data.user._id
                })
                const targetUserRoom = io.sockets.adapter.rooms.get(data.userId)
                if (targetUserRoom) {
                    for (const socketId of targetUserRoom) {
                        const targetSocket = io.sockets.sockets.get(socketId)
                        if (targetSocket) {
                            targetSocket.leave(chatId)
                            targetSocket.emit("youWereRemoved" , {chatId})
                        }
                    }
                }
            } catch (error  : any) {
                console.error(`Fail to remove ${data.userId} from group Socket Error` , error)
                const validationResult = error?.cause?.extension?.issues || error?.issues || []
                socket.emit("groupError" , {message : error.message , issues : validationResult})
            }
        })
    }
    promoteToAdmin = (socekt :ISocket , io : Server)=>{
        return socekt.on("promoteToAdmin" , async(data : removeOrPormotionOrLeaveParticipantGQLDTO)=>{
            try {
                await SocketIOValidation(validators.removeOrPormotionOrLeaveParticipantGQL , data)
                const chat = await this.chatService.promoteToAdmin(socekt.data.user , data)
                const chatId = chat._id.toString()
                io.to(chatId).emit("groupUpdated",{
                    action: "MEMBER_PROMOTED",
                    chatId,
                    promotedUserId: data.userId,
                    admins: chat.admins,
                })
            } catch (error : any) {
                console.error(`Fail to promoted ${data.userId} To Admin Socket Error`)
                const validationResult = error?.cause?.extension?.issues || error?.issues || []
                socekt.emit("groupError",{message : error?.message , issues : validationResult})
            }
        })
    }
    leaveGroup = (socket : ISocket , io : Server)=>{
        return socket.on("leaveGroup" , async(data : removeOrPormotionOrLeaveParticipantGQLDTO)=>{
            try {
                await SocketIOValidation(validators.removeOrPormotionOrLeaveParticipantGQL , data)
                const message = await this.chatService.leaveGroup(socket.data.user , data)
                const chatId = data.chatId
                io.to(chatId).emit("groupUpdated",{
                    action: "MEMBER_LEFT",
                    chatId,
                    userId: socket.data.user._id,
                })
            } catch (error : any) {
                console.error(`${data.userId} Fail to leave group Socket Error:` , error)
                const validationResult = error?.cause?.extensions?.issues || error?.issues || [];
                socket.emit("groupError", { message: error?.message, issues: validationResult });
            }
        })
    }

}
export const chatEvents = new ChatEvents()