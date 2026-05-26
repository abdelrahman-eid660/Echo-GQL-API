import { GraphQLList } from "graphql";
import * as commentGQLArgs from "./comment.args.gql";
import { commentResolver, CommentResolver } from "./comment.resolver";
import * as  commentGQLTypes from "./comment.types.gql";

export class CommentSchema {
    private commentResolver : CommentResolver
    constructor(){
        this.commentResolver = commentResolver
    }
    registerQuery(){
        return {
            comments : {
                type : new GraphQLList(commentGQLTypes.commentGQLTypes),
                args : commentGQLArgs.commentGQLArgs,
                resolve : this.commentResolver.getComments
            },
            getComment : {
                type : commentGQLTypes.commentGQLTypes,
                args : commentGQLArgs.getCommentGQLArgs,
                resolve : this.commentResolver.getComment
            }
        }
    }
    registerMutation(){
        return {
            replyComment : {
                type : commentGQLTypes.commentGQLTypes,
                args : commentGQLArgs.createCommentGQLArgs,
                resolve : commentResolver.replyComment,
            },
            createComment : {
                type : commentGQLTypes.commentGQLTypes,
                args : commentGQLArgs.createCommentGQLArgs,
                resolve : commentResolver.createComment,
            },
            updateComment : {
                type : commentGQLTypes.commentGQLTypes,
                args : commentGQLArgs.createCommentGQLArgs,
                resolve : commentResolver.updateComment,
            },
            deleteComment : {
                type : commentGQLTypes.deleteGQLTypes,
                args : commentGQLArgs.getCommentGQLArgs,
                resolve : commentResolver.deleteComment,
            }
        }
    }
}
export const commentSchema = new CommentSchema()