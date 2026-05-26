import { GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";

export const commentGQLArgs = {
    postId : {type : new GraphQLNonNull(GraphQLID) , description: "The ID of the post to fetch comments for"}, 
    cursor : {type : GraphQLID, description: "The comment ID boundary for fetching the next page of rows (Pagination)"},
    limit : {type: GraphQLInt, description: "Number of comments to return per page"},
}
export const getCommentGQLArgs = {
    postId : {type : new GraphQLNonNull(GraphQLID)}, 
    commentId : {type : new GraphQLNonNull(GraphQLID) , description: "Direct target comment ID to fetch"}, 
}
export const createCommentGQLArgs = {
    postId : {type : new GraphQLNonNull(GraphQLID), description: "The post ID where the comment will be added"}, 
    commentId : {type: GraphQLID, description: "Optional: Pass parent comment ID ONLY if this is a reply to another comment"}, 
    content : {type : GraphQLString}, 
    attachment : {type : new GraphQLInputObjectType({
        name : "AttachmentReplyCommentInput",
        fields : {
            image : {type : new GraphQLList(GraphQLString)},
            video : {type : new GraphQLList(GraphQLString)},
        }
    })}, 
    mentions : {type: new GraphQLList(GraphQLID), description: "Array of user IDs tagged in this comment using @"}
}