"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostArgs = exports.updatePostArgs = exports.deletePostArgs = exports.getPostArgs = exports.getPostsArgs = exports.OnePostUpdateArgs = void 0;
const graphql_1 = require("graphql");
const post_types_gql_1 = require("./post.types.gql");
exports.OnePostUpdateArgs = new graphql_1.GraphQLInputObjectType({
    name: "OnePostUpdateArgs",
    description: "Data structure payload for patching existing post fields",
    fields: () => ({
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLInputObjectType({
                name: "PostAttachmentsUpdateInput",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) || graphql_1.GraphQLString },
                }
            }) },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID), description: "Updated array of tagged user IDs" },
        mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID), description: "Updated array of mentioned user IDs" },
        availability: { type: post_types_gql_1.availabilityGraphEnum },
    }),
});
exports.getPostsArgs = {
    cursor: { type: graphql_1.GraphQLID, description: "Pass the nextCursor received from the previous payload" },
    limit: { type: graphql_1.GraphQLInt, description: "The volume of items requested per page fetch" },
};
exports.getPostArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "The unique Mongo document ID of the targeted post" },
};
exports.deletePostArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    force: { type: graphql_1.GraphQLBoolean, description: "Set to TRUE to wipe completely from the system instead of soft-deleting" },
};
exports.updatePostArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    data: { type: new graphql_1.GraphQLNonNull(exports.OnePostUpdateArgs) },
};
exports.createPostArgs = {
    content: { type: graphql_1.GraphQLString },
    attachments: { type: new graphql_1.GraphQLInputObjectType({
            name: "PostAttachmentsCreateInput",
            fields: {
                image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
            }
        }) },
    availability: { type: post_types_gql_1.availabilityGraphEnum },
    tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
};
