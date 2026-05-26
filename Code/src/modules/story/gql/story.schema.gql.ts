import {StoryResolver , storyResolver} from './story.resolver'
import * as StoryTypes from './story.types.gql'
import * as StoryArgs from './story.args.gql'
export class StorySchema {
    private storyResolver : StoryResolver
    constructor(){
        this.storyResolver = storyResolver
    }
    registerQuery(){
        return {
            getStories : {
                type : StoryTypes.GetStoriesResponse,
                args : StoryArgs.getStoriesArgs,
                resolve : this.storyResolver.getStories
            },
            watchStory : {
                type : StoryTypes.StoryMessageResponse,
                args : StoryArgs.watchStoryArgs,
                resolve : this.storyResolver.watchStory
            },
            getUserStories : {
                type : StoryTypes.GetUserStoriesResponse,
                args : StoryArgs.getUserStoriesArgs,
                resolve : this.storyResolver.getUserStories
            },
            getViewerAndReactsStories : {
                type : StoryTypes.GetViewerAndReactsStoriesResponse,
                args : StoryArgs.getViewerAndReactsStoriesArgs,
                resolve : this.storyResolver.getViewerAndReactsStories
            },
        }
    }
    registerMutation(){
        return {
            createStory : {
                type : StoryTypes.OneStoryType,
                args : StoryArgs.createStoryArgs,
                resolve : this.storyResolver.createStory
            },
            updateStory : {
                type : StoryTypes.OneStoryType,
                args : StoryArgs.updateStoryArgs,
                resolve : this.storyResolver.updateStory
            },
            deleteStory : {
                type : StoryTypes.StoryMessageResponse,
                args : StoryArgs.deleteStoryArgs,
                resolve : this.storyResolver.deleteStory
            },
        }
    }
}
export const storySchema = new StorySchema()