"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentGQLArgs = exports.getCommentGQLArgs = exports.commentGQLArgs = void 0;
const graphql_1 = require("graphql");
exports.commentGQLArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "The ID of the post to fetch comments for" },
    cursor: { type: graphql_1.GraphQLID, description: "The comment ID boundary for fetching the next page of rows (Pagination)" },
    limit: { type: graphql_1.GraphQLInt, description: "Number of comments to return per page" },
};
exports.getCommentGQLArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    commentId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "Direct target comment ID to fetch" },
};
exports.createCommentGQLArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "The post ID where the comment will be added" },
    commentId: { type: graphql_1.GraphQLID, description: "Optional: Pass parent comment ID ONLY if this is a reply to another comment" },
    content: { type: graphql_1.GraphQLString },
    attachment: { type: new graphql_1.GraphQLInputObjectType({
            name: "AttachmentReplyCommentInput",
            fields: {
                image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
            }
        }) },
    mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID), description: "Array of user IDs tagged in this comment using @" }
};
