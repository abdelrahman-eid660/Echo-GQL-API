"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveGroupType = exports.CreateGroupType = exports.OneMessageType = exports.OneChatType = exports.ChatTypeEnumGQL = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const enum_1 = require("../../../common/enum");
exports.ChatTypeEnumGQL = new graphql_1.GraphQLEnumType({
    name: "ChatTypeEnumGQL",
    description: "Defines whether the chat is One-to-One (OVO) or One-to-Many / Group (OVM)",
    values: {
        OVO: { value: enum_1.chatTypeEnum.OVO },
        OVM: { value: enum_1.chatTypeEnum.OVM },
    },
});
exports.OneChatType = new graphql_1.GraphQLObjectType({
    name: "OneChatType",
    description: "The main wrapper for fetching a conversation with its messages",
    fields: () => ({
        chat: {
            type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
                name: "GetChatResponse",
                fields: () => ({
                    _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                    participants: {
                        type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(user_types_gql_1.OneUserType)),
                    },
                    chatType: { type: new graphql_1.GraphQLNonNull(exports.ChatTypeEnumGQL) },
                    conversationKey: { type: graphql_1.GraphQLString, description: "Encrypted or unique system key to identify individual conversations" },
                    groupName: { type: graphql_1.GraphQLString },
                    groupImage: { type: graphql_1.GraphQLString },
                    groupDescription: { type: graphql_1.GraphQLString },
                    admins: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType) },
                    deletedFor: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType), description: "List of users who cleared or soft-deleted this chat history for themselves" },
                    lastMessageId: { type: exports.OneMessageType },
                    createdAt: { type: graphql_1.GraphQLString },
                    updatedAt: { type: graphql_1.GraphQLString },
                })
            })),
        },
        messages: { type: new graphql_1.GraphQLList(exports.OneMessageType), description: "List of messages fetched for this specific conversation room" },
        nextCursor: { type: graphql_1.GraphQLString, description: "The ID cursor used to fetch the next page of older messages (Pagination)" }
    }),
});
exports.OneMessageType = new graphql_1.GraphQLObjectType({
    name: "OneMessageType",
    description: "Detailed object representing a single message inside a chat",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        chatId: { type: new graphql_1.GraphQLNonNull(exports.OneChatType) },
        senderId: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserType) },
        content: { type: graphql_1.GraphQLString },
        attachments: {
            type: new graphql_1.GraphQLList(new graphql_1.GraphQLObjectType({
                name: "messageAttchmentResponse",
                fields: {
                    Key: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "S3 Cloud Storage key or URL path" },
                    fileName: { type: graphql_1.GraphQLString },
                    fileType: { type: graphql_1.GraphQLString },
                },
            })),
        },
        mentions: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType), description: "Users tagged inside this message using @" },
        seenBy: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType), description: "List of participants who opened and viewed this message" },
        deliveredTo: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType), description: "List of participants whose devices received the packet" },
        replyTo: { type: exports.OneMessageType, description: "References the original message if this is a reply" },
        deletedAt: { type: graphql_1.GraphQLString },
        reactsCount: { type: graphql_1.GraphQLInt },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.CreateGroupType = new graphql_1.GraphQLObjectType({
    name: "CreateGroupType",
    description: "Response structure after establishing a new group conversation",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        chatType: { type: new graphql_1.GraphQLNonNull(exports.ChatTypeEnumGQL) },
        participants: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLID)) },
        groupName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        admins: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLID)) },
        groupImage: { type: graphql_1.GraphQLString },
        groupDescription: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.leaveGroupType = new graphql_1.GraphQLObjectType({
    name: "leaveGroupType",
    description: "General message response after leaving a group successfully",
    fields: () => ({
        message: { type: graphql_1.GraphQLString }
    }),
});
