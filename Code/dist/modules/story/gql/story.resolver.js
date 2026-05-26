"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyResolver = exports.StoryResolver = void 0;
const middleware_1 = require("../../../middleware");
const story_service_1 = require("../story.service");
const story_validation_1 = require("../story.validation");
const service_1 = require("../../../common/service");
const exception_1 = require("../../../common/exception");
class StoryResolver {
    storyService;
    rateLimitServer;
    constructor() {
        this.storyService = story_service_1.storyService;
        this.rateLimitServer = service_1.rateLimiterServer;
    }
    createStory = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeStoryAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(story_validation_1.createStoryGQL, args);
        const story = await this.storyService.createStory(user, args);
        return story;
    };
    updateStory = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeStoryAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(story_validation_1.updateStoryGQL, args);
        const story = await this.storyService.updateStory(user, args);
        return story;
    };
    getStories = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(story_validation_1.getStoriesGQL, args);
        const { stories, hasMore, nextCursor } = await this.storyService.getStories(user, args);
        return { stories, nextCursor, hasMore };
    };
    getUserStories = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(story_validation_1.getUserStoriesGQL, args);
        const stories = await this.storyService.getUserStories(user, args);
        return { stories };
    };
    getViewerAndReactsStories = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(story_validation_1.getViewerAndReactsStoriesGQL, args);
        const reasult = await this.storyService.getViewerAndReactsStories(user, args);
        return { stories: reasult };
    };
    watchStory = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(story_validation_1.watchStoryGQL, args);
        const result = await this.storyService.watchStory(user, args);
        return { message: result };
    };
    deleteStory = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(story_validation_1.deleteStoryGQL, args);
        const result = await this.storyService.deleteStory(user, args);
        return { message: result };
    };
}
exports.StoryResolver = StoryResolver;
exports.storyResolver = new StoryResolver();
