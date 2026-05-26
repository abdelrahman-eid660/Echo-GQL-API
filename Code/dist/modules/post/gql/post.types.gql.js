"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.GetPostResponse = exports.GetPostsResponse = exports.OnePostUpdateType = exports.createPostType = exports.OnePostType = exports.availabilityGraphEnum = void 0;
const graphql_1 = require("graphql");
const enum_1 = require("../../../common/enum");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
exports.availabilityGraphEnum = new graphql_1.GraphQLEnumType({
    name: "Availability",
    description: "Privacy settings for who can view the post",
    values: {
        Public: { value: enum_1.availabilityEnum.PUBLIC },
        OnlyFriends: { value: enum_1.availabilityEnum.ONLYFRIENDS },
        Private: { value: enum_1.availabilityEnum.PRIVATE },
    }
});
exports.OnePostType = new graphql_1.GraphQLObjectType({
    name: "OnePostType",
    description: "Represents a core post entity within the system",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        Publisher: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserPopulateType), description: "The author/publisher profile data" },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLObjectType({
                name: "attachments",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString), description: "Array of image URLs attached to the post" },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString), description: "Array of video URLs attached to the post" },
                }
            }) },
        userId: { type: graphql_1.GraphQLID, description: "Direct reference to the user ID (useful for flat mutation responses)" },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType), description: "Users tagged inside the post container" },
        mentions: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType), description: "Users explicitly mentioned inside the post text" },
        availability: { type: exports.availabilityGraphEnum },
        reactsCount: { type: graphql_1.GraphQLInt, description: "Total reactions received" },
        commentsCount: { type: graphql_1.GraphQLInt, description: "Total comments and replies count" },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        unfreezedAt: { type: graphql_1.GraphQLString },
        freezedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.createPostType = new graphql_1.GraphQLObjectType({
    name: "CreatePostTypeResponse",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLObjectType({
                name: "Create_Post_attachments",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                }
            }) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType) },
        mentions: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType) },
        availability: { type: exports.availabilityGraphEnum },
        reactsCount: { type: graphql_1.GraphQLInt },
        commentsCount: { type: graphql_1.GraphQLInt },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        unfreezedAt: { type: graphql_1.GraphQLString },
        freezedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.OnePostUpdateType = new graphql_1.GraphQLObjectType({
    name: "OnePostUpdateType",
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        userId: { type: graphql_1.GraphQLID },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLObjectType({
                name: "attachmentsUpdate",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                }
            }) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType) },
        mentions: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserPopulateType) },
        availability: { type: exports.availabilityGraphEnum },
        reactsCount: { type: graphql_1.GraphQLInt },
        commentsCount: { type: graphql_1.GraphQLInt },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        unfreezedAt: { type: graphql_1.GraphQLString },
        freezedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.GetPostsResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "GetPostsResponse",
    description: "Wrapped list payload supporting infinite scroll pagination",
    fields: {
        data: { type: new graphql_1.GraphQLObjectType({
                name: "PostPagination",
                fields: {
                    posts: { type: new graphql_1.GraphQLList(exports.OnePostType) },
                    nextCursor: { type: graphql_1.GraphQLID, description: "The timestamp or ID boundary for the next chunk of posts" },
                    hasMore: { type: graphql_1.GraphQLBoolean, description: "Flag to inform the UI if extra pages are left to fetch" },
                }
            }) }
    }
}));
exports.GetPostResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "GetPostResponse",
    description: "Wrapped payload for locating a solitary post record",
    fields: {
        data: { type: new graphql_1.GraphQLObjectType({
                name: "GetPostByIdPayload",
                fields: {
                    post: { type: exports.OnePostType },
                }
            }) }
    }
}));
exports.Message = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "PostMessageResponse",
    description: "Standard text acknowledgment post mutation lifecycle events",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    },
}));
