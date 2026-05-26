"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOrPormotionOrLeaveParticipantArgs = exports.addParticipantsArgs = exports.createGroupGQLArgs = exports.sendMessageGQLArgs = exports.getChatGQLArgs = void 0;
const graphql_1 = require("graphql");
const chat_types_gql_1 = require("./chat.types.gql");
exports.getChatGQLArgs = {
    receiverId: { type: graphql_1.GraphQLID, description: "Required if opening a 1-to-1 chat for the first time" },
    chatId: { type: graphql_1.GraphQLID, description: "Direct target chat room ID" },
    cursor: { type: graphql_1.GraphQLID, description: "The message ID boundary to fetch previous records before it" },
    limit: { type: graphql_1.GraphQLInt, description: "Number of messages to retrieve per request" },
    chatType: { type: graphql_1.GraphQLString },
};
exports.sendMessageGQLArgs = {
    receiverId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    chatId: { type: graphql_1.GraphQLID },
    chatType: { type: new graphql_1.GraphQLNonNull(chat_types_gql_1.ChatTypeEnumGQL) },
    content: { type: graphql_1.GraphQLString },
    attachments: { type: new graphql_1.GraphQLList(new graphql_1.GraphQLInputObjectType({
            name: "attachmentsInputs",
            fields: {
                Key: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                fileName: { type: graphql_1.GraphQLString },
                fileType: { type: graphql_1.GraphQLString },
            }
        })) },
    mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    replyTo: { type: graphql_1.GraphQLID, description: "The message ID being replied to" },
};
exports.createGroupGQLArgs = {
    chatType: { type: new graphql_1.GraphQLNonNull(chat_types_gql_1.ChatTypeEnumGQL) },
    participants: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID))) },
    groupName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    admins: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID))) },
    groupImage: { type: graphql_1.GraphQLString },
    groupDescription: { type: graphql_1.GraphQLString },
};
exports.addParticipantsArgs = {
    chatId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    participants: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID))) },
};
exports.removeOrPormotionOrLeaveParticipantArgs = {
    chatId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "Target user to remove, promote, or leave" },
};
