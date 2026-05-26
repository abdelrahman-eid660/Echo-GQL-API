import { postResolver, PostResolver } from "./post.resolver";
import * as PostGQLTypes from "./post.types.gql";
import * as PostGQLArgs from "./post.args.gql";
export class PostSchema {
    private postResolver : PostResolver
    constructor(){
        this.postResolver = postResolver
    }
    registerQuery(){
        return {
            getAllPosts : {
                type : PostGQLTypes.GetPostsResponse,
                args : PostGQLArgs.getPostsArgs,
                resolve : this.postResolver.getPosts
            },
            getPost : {
                type : PostGQLTypes.GetPostResponse,
                args : PostGQLArgs.getPostArgs,
                resolve : this.postResolver.getPost
            }
        }
    }
    registerMutation(){
        return {
            create_post : {
                type : PostGQLTypes.createPostType,
                args : PostGQLArgs.createPostArgs,
                resolve : this.postResolver.createPost
            },
            update_post : {
                type : PostGQLTypes.OnePostUpdateType,
                args : PostGQLArgs.updatePostArgs,
                resolve : this.postResolver.updatePost
            },
            delete_post : {
                type : PostGQLTypes.Message,
                args : PostGQLArgs.deletePostArgs,
                resolve : this.postResolver.deletePost
            }
        }
    }
}
export const postSchema = new PostSchema() 