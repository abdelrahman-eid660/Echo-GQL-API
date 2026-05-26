import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

export const commentGQLTypes = new GraphQLObjectType({
    name : "CommentType",
    description: "Represents a single comment or a reply structure on a post",
    fields : ()=>({
          _id: {type : new GraphQLNonNull(GraphQLID)},
          userId: {type : new GraphQLNonNull(GraphQLID), description: "The author of the comment"},
          postId: {type : new GraphQLNonNull(GraphQLID)},
          content: {type : GraphQLString},
          attachments:{type : new GraphQLObjectType({
            name : "CommentAttachmentResponse",
            fields : {
                image : {type : new GraphQLList(GraphQLString)},
                video : {type : new GraphQLList(GraphQLString)},
            }
          })},
          parentComment: {type : GraphQLID , description: "If this field exists, it means this comment is a reply to the specified parent comment ID"},
          reactsCount: {type : GraphQLInt},
          mentions: {type : new GraphQLList(GraphQLID)},
          createdAt: {type : new GraphQLNonNull(GraphQLString)},
          updatedAt: {type : new GraphQLNonNull(GraphQLString)},
          deletedAt: {type : GraphQLString},
    })
})
export const deleteGQLTypes = new GraphQLObjectType({
   name: "DeleteCommentResponse",
   description: "Standard message returned after a successful comment deletion",
   fields: () => ({
    message: { type: GraphQLString }
  })
})