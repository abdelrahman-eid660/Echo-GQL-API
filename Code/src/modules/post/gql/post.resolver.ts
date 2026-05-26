import { HydratedDocument, Types } from "mongoose";
import { postService, PostService } from "../post.service";
import {IPost } from "../../../common/interface";
import { GraphQLValidation, isAuthenticated, isAuthorized } from "../../../middleware";
import { endPoint } from "../post.auth";
import { createPostDTO, getPostDTO, getPostsDTO } from "../post.dto";
import { creatPost, getPostsGQL } from "../post.validation";
import { rateLimiterServer, RateLimiterServer } from "../../../common/service";
import { BadRequestException } from "../../../common/exception";

export class PostResolver {
    private postService : PostService
    private readonly rateLimitServer : RateLimiterServer
    constructor(){
        this.postService = postService
        this.rateLimitServer = rateLimiterServer
    }
    createPost = async(parent : unknown , args : createPostDTO  , context : any):Promise<HydratedDocument<IPost>>=>{
        const {user} = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumePostAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }
        await isAuthorized(endPoint.GeneralAuth , user)
        await GraphQLValidation<createPostDTO>(creatPost , args)
        const data = await this.postService.createPost(user , args)
        return data
    }
    getPosts = async(parent : unknown , args : getPostsDTO , context : any):Promise<{ data : {posts : HydratedDocument<IPost>[], nextCursor : Types.ObjectId, hasMore: boolean}}>=>{
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(getPostsGQL , args)
        const {hasMore , nextCursor , posts} = await this.postService.getPosts(user , args )        
        return {data : {posts , nextCursor , hasMore}}
    }
    getPost = async(parent : unknown , args : getPostDTO  , context : any):Promise<{ data : {post : IPost}}>=>{
        const {user} = await isAuthenticated(context)
        const resualt = await this.postService.getPost(user , args )
        return {data : {post : resualt}}
    }
    updatePost = async(parent : unknown , args :any  , context : any):Promise<IPost>=>{        
        const {user} = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumePostAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }
        const resualt = await this.postService.updatePost(user , args.data as unknown as HydratedDocument<IPost> , args.postId )
        return resualt
    }
    deletePost = async(parent : unknown , args : getPostDTO  , context : any):Promise<{ message : string}>=>{
        const {user} = await isAuthenticated(context)
        const resualt = await this.postService.deletePost(user , args )
        return {message : resualt}
    }
}
export const postResolver = new PostResolver()