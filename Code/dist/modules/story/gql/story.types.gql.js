"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryMessageResponse = exports.GetStoriesResponse = exports.GetViewerAndReactsStoriesResponse = exports.GetUserStoriesResponse = exports.OneStoryType = exports.ReactTargetGQLEnum = exports.ReactGQLEnum = void 0;
const graphql_1 = require("graphql");
const post_types_gql_1 = require("../../post/gql/post.types.gql");
const enum_1 = require("../../../common/enum");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
exports.ReactGQLEnum = new graphql_1.GraphQLEnumType({
    name: "ReactEnumGQL",
    description: "All supported reactions types inside the application",
    values: {
        Angry: { value: enum_1.ReactEnum.ANGRY },
        Hahh: { value: enum_1.ReactEnum.HAHHH },
        Like: { value: enum_1.ReactEnum.LIKE },
        Love: { value: enum_1.ReactEnum.LOVE },
        Sad: { value: enum_1.ReactEnum.SAD },
        Support: { value: enum_1.ReactEnum.SUPPORT },
        Wow: { value: enum_1.ReactEnum.WOW },
    },
});
exports.ReactTargetGQLEnum = new graphql_1.GraphQLEnumType({
    name: "ReactTargetEnumGQL",
    description: "Identifies the target entity receiving the reaction packet",
    values: {
        Comment: { value: enum_1.ReactTargetEnum.COMMENT },
        Message: { value: enum_1.ReactTargetEnum.MESSAGE },
        Post: { value: enum_1.ReactTargetEnum.POST },
        Story: { value: enum_1.ReactTargetEnum.STORY },
        User: { value: enum_1.ReactTargetEnum.USER },
    },
});
exports.OneStoryType = new graphql_1.GraphQLObjectType({
    name: "StoryType",
    description: "Core entity representing a single story block",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        Publisher: { type: user_types_gql_1.OneUserPopulateType, description: "Populated publisher user data" },
        content: { type: graphql_1.GraphQLString },
        expiresAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "Auto-deletion timestamp (24-hour mark)" },
        attachments: {
            type: new graphql_1.GraphQLObjectType({
                name: "StoryAttachmentsResponse",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                },
            }),
        },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        availability: { type: post_types_gql_1.availabilityGraphEnum },
        reactsCount: { type: graphql_1.GraphQLInt },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        updatedAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        isOwner: { type: graphql_1.GraphQLBoolean, description: "True if the requesting user created this story" },
        isViewed: { type: graphql_1.GraphQLBoolean, description: "True if the current user has already watched this slice" },
        currentUserReact: { type: exports.ReactGQLEnum, description: "The active reaction type left by the client user" },
    }),
});
exports.GetUserStoriesResponse = new graphql_1.GraphQLObjectType({
    name: "GetUserStoriesResponse",
    description: "Returns a bundle of active stories for a targeted profile",
    fields: () => ({
        stories: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(exports.OneStoryType)) },
    }),
});
exports.GetViewerAndReactsStoriesResponse = new graphql_1.GraphQLObjectType({
    name: "GetViewerAndReactsStoriesResponse",
    description: "Analytics response holding logs of people who viewed/reacted to a story slice",
    fields: {
        stories: {
            type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLObjectType({
                name: "StoryAnalyticsPayload",
                fields: () => ({
                    viewer: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserPopulateType), description: "The profile that viewed the story" },
                    reacts: {
                        type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
                            name: "StoryReactDetails",
                            fields: () => ({
                                _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                                userId: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserPopulateType) },
                                targetId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                                targetType: { type: exports.ReactTargetGQLEnum },
                                type: { type: exports.ReactGQLEnum },
                                createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                            }),
                        })),
                    },
                    viewsCount: { type: graphql_1.GraphQLInt },
                }),
            }))),
        },
    },
});
exports.GetStoriesResponse = new graphql_1.GraphQLObjectType({
    name: "GetStoriesResponse",
    description: "Paginated feed containing chronological circle stories",
    fields: () => ({
        stories: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(exports.OneStoryType)) },
        nextCursor: { type: graphql_1.GraphQLID },
        hasMore: { type: graphql_1.GraphQLBoolean },
    }),
});
exports.StoryMessageResponse = new graphql_1.GraphQLObjectType({
    name: "StoryMessageResponse",
    fields: () => ({
        message: { type: graphql_1.GraphQLString },
    }),
});
