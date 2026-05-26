"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoryArgs = exports.watchStoryArgs = exports.getViewerAndReactsStoriesArgs = exports.getUserStoriesArgs = exports.getStoriesArgs = exports.updateStoryArgs = exports.createStoryArgs = exports.StoryAttachmentsInput = void 0;
const graphql_1 = require("graphql");
const post_types_gql_1 = require("../../post/gql/post.types.gql");
exports.StoryAttachmentsInput = new graphql_1.GraphQLInputObjectType({
    name: "StoryAttachmentsInput",
    fields: {
        image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
    },
});
exports.createStoryArgs = {
    content: { type: graphql_1.GraphQLString },
    attachments: { type: exports.StoryAttachmentsInput },
    tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    availability: { type: post_types_gql_1.availabilityGraphEnum },
};
exports.updateStoryArgs = {
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    availability: { type: post_types_gql_1.availabilityGraphEnum },
    mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
};
exports.getStoriesArgs = {
    limit: { type: graphql_1.GraphQLInt },
    cursor: { type: graphql_1.GraphQLID },
};
exports.getUserStoriesArgs = {
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
exports.getViewerAndReactsStoriesArgs = {
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
exports.watchStoryArgs = {
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
exports.deleteStoryArgs = {
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
