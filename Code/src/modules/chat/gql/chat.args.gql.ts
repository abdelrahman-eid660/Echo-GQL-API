import { GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { ChatTypeEnumGQL } from "./chat.types.gql";

export const getChatGQLArgs = {
    receiverId : {type : GraphQLID , description: "Required if opening a 1-to-1 chat for the first time"}, 
    chatId : {type : GraphQLID, description: "Direct target chat room ID"}, 
    cursor : {type : GraphQLID , description: "The message ID boundary to fetch previous records before it"},
    limit : {type : GraphQLInt , description: "Number of messages to retrieve per request"},
    chatType : {type : GraphQLString},   
}
export const sendMessageGQLArgs = {
    receiverId : {type : new GraphQLNonNull(GraphQLID)}, 
    chatId : {type : GraphQLID}, 
    chatType : {type : new GraphQLNonNull(ChatTypeEnumGQL)}, 
    content : {type : GraphQLString},
    attachments : {type : new GraphQLList(new GraphQLInputObjectType({
        name : "attachmentsInputs",
        fields : {
            Key : {type : new GraphQLNonNull(GraphQLString)},
            fileName : {type : GraphQLString},
            fileType : {type : GraphQLString},
        }
    }))},
    mentions: {type : new GraphQLList(GraphQLID)},
    replyTo: {type : GraphQLID , description: "The message ID being replied to"},
}
export const createGroupGQLArgs = {
    chatType : {type : new GraphQLNonNull(ChatTypeEnumGQL)}, 
    participants: {type : new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))},
    groupName: {type : new GraphQLNonNull(GraphQLString)},
    admins: {type : new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))},
    groupImage: {type : GraphQLString},
    groupDescription: {type : GraphQLString},
}
export const addParticipantsArgs = {
    chatId : {type : new GraphQLNonNull(GraphQLID)},
    participants : {type : new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))},
}
export const removeOrPormotionOrLeaveParticipantArgs = {
    chatId : {type : new GraphQLNonNull(GraphQLID)},
    userId : {type : new GraphQLNonNull(GraphQLID) , description: "Target user to remove, promote, or leave"},
}