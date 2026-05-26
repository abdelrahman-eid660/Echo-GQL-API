import { chatResolver, ChatResolver } from "./chat.resolver"
import * as chatTypes from './chat.types.gql'
import * as chatArgs from './chat.args.gql'
export class ChatSchema {
    private chatResolver : ChatResolver
    constructor(){
        this.chatResolver = chatResolver
    }
    registerQuery(){
        return {
            getChat : {
                type : chatTypes.OneChatType,
                args : chatArgs.getChatGQLArgs,
                resolve : this.chatResolver.getChat
            }
        }
    }
    registerMutation(){
        return {
            sendMessage : {
                type : chatTypes.OneMessageType,
                args : chatArgs.sendMessageGQLArgs,
                resolve : this.chatResolver.sendMessage
            },
            createGroup : {
                type : chatTypes.CreateGroupType,
                args : chatArgs.createGroupGQLArgs,
                resolve : this.chatResolver.createGroup
            },
            addParticipants : {
                type : chatTypes.CreateGroupType,
                args : chatArgs.addParticipantsArgs,
                resolve : this.chatResolver.addParticipants
            },
            removeParticipant : {
                type : chatTypes.CreateGroupType,
                args : chatArgs.removeOrPormotionOrLeaveParticipantArgs,
                resolve : this.chatResolver.removeParticipant
            },
            promoteToAdmin : {
                type : chatTypes.CreateGroupType,
                args : chatArgs.removeOrPormotionOrLeaveParticipantArgs,
                resolve : this.chatResolver.promoteToAdmin
            },
            leaveGroup : {
                type : chatTypes.leaveGroupType,
                args : chatArgs.removeOrPormotionOrLeaveParticipantArgs,
                resolve : this.chatResolver.leaveGroup
            }
        }
    }
}

export const chatschema = new ChatSchema()