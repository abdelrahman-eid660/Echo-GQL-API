import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";
import { chatTypeEnum } from "../../../common/enum";

export const ChatTypeEnumGQL = new GraphQLEnumType({
  name: "ChatTypeEnumGQL",
  description: "Defines whether the chat is One-to-One (OVO) or One-to-Many / Group (OVM)",
  values: {
    OVO: { value: chatTypeEnum.OVO },
    OVM: { value: chatTypeEnum.OVM },
  },
});
export const OneChatType: GraphQLObjectType = new GraphQLObjectType({
  name: "OneChatType",
  description: "The main wrapper for fetching a conversation with its messages",
  fields: () => ({
    chat: {
      type: new GraphQLNonNull(
        new GraphQLObjectType({
          name: "GetChatResponse",
          fields:()=> ({
            _id: { type: new GraphQLNonNull(GraphQLID) },
            participants: {
              type: new GraphQLNonNull(new GraphQLList(OneUserType)),
            },
            chatType: { type: new GraphQLNonNull(ChatTypeEnumGQL) },
            conversationKey: { type: GraphQLString , description: "Encrypted or unique system key to identify individual conversations"},
            groupName: { type: GraphQLString },
            groupImage: { type: GraphQLString },
            groupDescription: { type: GraphQLString },
            admins: { type: new GraphQLList(OneUserType) },
            deletedFor: { type: new GraphQLList(OneUserType) , description: "List of users who cleared or soft-deleted this chat history for themselves" },
            lastMessageId: { type: OneMessageType },
            createdAt: { type: GraphQLString },
            updatedAt: { type: GraphQLString },
          })
        }),
      ),
    },
    messages : {type : new GraphQLList(OneMessageType) , description: "List of messages fetched for this specific conversation room"},
    nextCursor : {type : GraphQLString , description: "The ID cursor used to fetch the next page of older messages (Pagination)"}
  }),
});
export const OneMessageType: GraphQLObjectType = new GraphQLObjectType({
  name: "OneMessageType",
  description: "Detailed object representing a single message inside a chat",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    chatId: { type: new GraphQLNonNull(OneChatType) },
    senderId: { type: new GraphQLNonNull(OneUserType) },
    content: { type: GraphQLString },
    attachments: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "messageAttchmentResponse",
          fields: {
            Key: { type: new GraphQLNonNull(GraphQLString) , description: "S3 Cloud Storage key or URL path" },
            fileName: { type: GraphQLString },
            fileType: { type: GraphQLString },
          },
        }),
      ),
    },
    mentions: { type: new GraphQLList(OneUserType) , description: "Users tagged inside this message using @"},
    seenBy: { type: new GraphQLList(OneUserType) , description: "List of participants who opened and viewed this message" },
    deliveredTo: { type: new GraphQLList(OneUserType), description: "List of participants whose devices received the packet" },
    replyTo: { type: OneMessageType , description: "References the original message if this is a reply"},
    deletedAt: { type: GraphQLString },
    reactsCount: { type: GraphQLInt },
    restoredAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});
export const CreateGroupType: GraphQLObjectType = new GraphQLObjectType({
  name: "CreateGroupType",
  description: "Response structure after establishing a new group conversation",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    chatType : {type : new GraphQLNonNull(ChatTypeEnumGQL)}, 
    participants: {type : new GraphQLNonNull(new GraphQLList(GraphQLID))},
    groupName: {type : new GraphQLNonNull(GraphQLString)},
    admins: {type : new GraphQLNonNull(new GraphQLList(GraphQLID))},
    groupImage: {type : GraphQLString},
    groupDescription: {type : GraphQLString},
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});
export const leaveGroupType: GraphQLObjectType = new GraphQLObjectType({
  name: "leaveGroupType",
  description: "General message response after leaving a group successfully",
  fields:()=>({
    message : {type : GraphQLString}
  }),
});
