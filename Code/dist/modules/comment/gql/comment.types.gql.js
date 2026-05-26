"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGQLTypes = exports.commentGQLTypes = void 0;
const graphql_1 = require("graphql");
exports.commentGQLTypes = new graphql_1.GraphQLObjectType({
    name: "CommentType",
    description: "Represents a single comment or a reply structure on a post",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "The author of the comment" },
        postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLObjectType({
                name: "CommentAttachmentResponse",
                fields: {
                    image: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                    video: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                }
            }) },
        parentComment: { type: graphql_1.GraphQLID, description: "If this field exists, it means this comment is a reply to the specified parent comment ID" },
        reactsCount: { type: graphql_1.GraphQLInt },
        mentions: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        updatedAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        deletedAt: { type: graphql_1.GraphQLString },
    })
});
exports.deleteGQLTypes = new graphql_1.GraphQLObjectType({
    name: "DeleteCommentResponse",
    description: "Standard message returned after a successful comment deletion",
    fields: () => ({
        message: { type: graphql_1.GraphQLString }
    })
});
