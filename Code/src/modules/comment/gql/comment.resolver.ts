import { BadRequestException } from "../../../common/exception"
import { IComment } from "../../../common/interface"
import { RateLimiterServer, rateLimiterServer } from "../../../common/service"
import { GraphQLValidation, isAuthenticated } from "../../../middleware"
import { createCommentGQLDTO, getAllCommentsGQLDTO, getCommentGQLDTO, replyCommentGQLDTO } from "../comment.dto"
import { commentService, CommentService } from "../comment.service"
import { creatCommentGQLValidation, getAllCommentsGQLValidation, getCommentGQLValidation, replyCommentGQLVliadation } from "../comment.validation"

export class CommentResolver {
    private commentService : CommentService
    private readonly rateLimitServer : RateLimiterServer

    constructor(){
        this.commentService = commentService
        this.rateLimitServer = rateLimiterServer
    }
    createComment = async(parent : unknown , args : createCommentGQLDTO , context : any ):Promise<IComment>=>{
        const {user} = await isAuthenticated(context) 
        try {
            await this.rateLimitServer.consumeCommentAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(creatCommentGQLValidation , args) 
        const data = await commentService.createComment(user , args )        
        return data
    }
    getComments = async(parent : unknown , args : getAllCommentsGQLDTO , context : any ):Promise<IComment[]>=>{
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(getAllCommentsGQLValidation , args) 
        const data = await commentService.getAllComments(user , args)        
        return data
    }
    getComment = async(parent : unknown , args : getCommentGQLDTO , context : any ):Promise<IComment>=>{
        const {user} = await isAuthenticated(context)  
        await GraphQLValidation(getCommentGQLValidation , args)      
        const data = await commentService.getComment(user , args )        
        return data
    }
    replyComment = async(parent : unknown , args : replyCommentGQLDTO , context : any ):Promise<IComment>=>{
        const {user} = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumeCommentAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(replyCommentGQLVliadation , args)       
        const data = await commentService.replyComment(user , args )        
        return data
    }
    updateComment = async(parent : unknown , args : createCommentGQLDTO , context : any ):Promise<IComment>=>{
        const {user} = await isAuthenticated(context) 
        try {
            await this.rateLimitServer.consumeCommentAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(creatCommentGQLValidation , args)       
        const data = await commentService.updateComment(user , args )        
        return data
    }
    deleteComment = async(parent : unknown , args : getCommentGQLDTO , context : any ):Promise<{message : string}>=>{
        const {user} = await isAuthenticated(context)   
        await GraphQLValidation(getCommentGQLValidation , args)     
        const data = await commentService.deleteComment(user , args )  
        return {message : data}
    }
}
export const commentResolver = new CommentResolver()