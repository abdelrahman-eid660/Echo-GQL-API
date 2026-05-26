import { IChat, IMessage } from "../../../common/interface"
import { GraphQLValidation, isAuthenticated } from "../../../middleware"
import { addParticipantsGQLDTO, createGroupGQLDTO, getChatGQLDTO, removeOrPormotionOrLeaveParticipantGQLDTO, sendMessageGQLDTO } from "../chat.dto"
import { chatService, ChatService } from "../chat.service"
import { addParticipantsGQL, createGroupGQL, getChatGQL, removeOrPormotionOrLeaveParticipantGQL } from "../chat.validation"

export class ChatResolver {
    private chatService : ChatService
    constructor(){
        this.chatService = chatService
    }
    sendMessage = async (parent : unknown , args : sendMessageGQLDTO , context : any):Promise<{message : IMessage}>=>{
        const {user} = await isAuthenticated(context)
        const message = await this.chatService.sendMessage(user , args)
        return {message}
    }
    getChat = async (parent : unknown , args : getChatGQLDTO , context : any): Promise<{chat : IChat , messages : IMessage[] , nextCursor : Date | null | undefined}> => {
    const {user} = await isAuthenticated(context)
    await GraphQLValidation(getChatGQL , args)
    const {chat , messages , nextCursor} = await this.chatService.getChat(user , args)
    return {chat , messages , nextCursor} 
    }
    createGroup = async (parent : unknown , args : createGroupGQLDTO , context : any): Promise<IChat> => {
    const {user} = await isAuthenticated(context)    
    await GraphQLValidation(createGroupGQL , args)
    const group = await this.chatService.createGroup(user , args)
    return group 
    }
    addParticipants = async (parent : unknown , args : addParticipantsGQLDTO , context : any): Promise<IChat> => {
    const {user} = await isAuthenticated(context)    
    await GraphQLValidation(addParticipantsGQL , args)
    const group = await this.chatService.addParticipants(user , args)
    return group 
    }
    removeParticipant = async (parent : unknown , args : removeOrPormotionOrLeaveParticipantGQLDTO , context : any): Promise<IChat> => {
    const {user} = await isAuthenticated(context)    
    await GraphQLValidation(removeOrPormotionOrLeaveParticipantGQL , args)
    const group = await this.chatService.removeParticipant(user , args)
    return group 
    }
    promoteToAdmin = async (parent : unknown , args : removeOrPormotionOrLeaveParticipantGQLDTO , context : any): Promise<IChat> => {
    const {user} = await isAuthenticated(context)    
    await GraphQLValidation(removeOrPormotionOrLeaveParticipantGQL , args)
    const group = await this.chatService.promoteToAdmin(user , args)
    return group 
    }
    leaveGroup = async (parent : unknown , args : removeOrPormotionOrLeaveParticipantGQLDTO , context : any): Promise<{message : string}> => {
    const {user} = await isAuthenticated(context)    
    await GraphQLValidation(removeOrPormotionOrLeaveParticipantGQL  , args)
    const message = await this.chatService.leaveGroup(user , args)
    return {message} 
    }
}

export const chatResolver = new ChatResolver()