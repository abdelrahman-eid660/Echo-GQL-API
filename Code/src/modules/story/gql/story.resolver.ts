import { HydratedDocument, Types } from "mongoose";
import { GraphQLValidation, isAuthenticated } from "../../../middleware";
import { storyService, StoryService } from "../story.service";
import { IReact, IStory, IUser } from "../../../common/interface";
import { deleteStoryDTO, getStoriesDTO, getUserStoriesDTO, getViewerAndReactsStoriesDTO, updateStoryDTO, watchStoryDTO } from "../story.dto";
import { StoryWithViews } from "./story.types.gql";
import { createStoryGQL, deleteStoryGQL, getStoriesGQL, getUserStoriesGQL, getViewerAndReactsStoriesGQL, updateStoryGQL, watchStoryGQL } from "../story.validation";
import { rateLimiterServer, RateLimiterServer } from "../../../common/service";
import { BadRequestException } from "../../../common/exception";

export class StoryResolver {
    private storyService : StoryService
    private readonly rateLimitServer : RateLimiterServer
    constructor(){
        this.storyService = storyService
        this.rateLimitServer = rateLimiterServer
    }
    createStory = async(parent : unknown , args : HydratedDocument<IStory> , context : any ):Promise<IStory>=>{
        const { user } = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumeStoryAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(createStoryGQL , args)
        const story = await this.storyService.createStory(user , args)
        return story
    }
    updateStory = async(parent : unknown , args : updateStoryDTO , context : any ):Promise<IStory>=>{
        const { user } = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumeStoryAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(updateStoryGQL , args)
        const story = await this.storyService.updateStory(user , args)
        return story
    }
    getStories = async(parent : unknown , args : getStoriesDTO , context : any ):Promise<{stories : IStory[] , nextCursor : Types.ObjectId | null | undefined , hasMore : boolean }>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(getStoriesGQL , args)
        const {stories , hasMore , nextCursor} = await this.storyService.getStories(user , args)        
        return {stories , nextCursor , hasMore}
    }
    getUserStories = async(parent : unknown , args : getUserStoriesDTO , context : any ):Promise<{stories : StoryWithViews[]}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(getUserStoriesGQL , args)
        const stories = await this.storyService.getUserStories(user , args)        
        return {stories} 
    }
    getViewerAndReactsStories = async(parent : unknown , args : getViewerAndReactsStoriesDTO , context : any ):Promise<{stories : {viewer:  IUser  | undefined , reacts : IReact | undefined , viewedAt: string}[]}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(getViewerAndReactsStoriesGQL , args)
        const reasult = await this.storyService.getViewerAndReactsStories(user , args)
        return {stories : reasult}
    }
    watchStory = async(parent : unknown , args : watchStoryDTO , context : any ):Promise<{message : string}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(watchStoryGQL , args)      
        const result = await this.storyService.watchStory(user , args)
        return {message : result}
    }
    deleteStory = async(parent : unknown , args : deleteStoryDTO , context : any ):Promise<{message : string}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(deleteStoryGQL , args)
        const result = await this.storyService.deleteStory(user , args)
        return {message : result}
    }

}
export const storyResolver = new StoryResolver()