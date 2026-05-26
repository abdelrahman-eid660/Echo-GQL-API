"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.storySchema = exports.StorySchema = void 0;
const story_resolver_1 = require("./story.resolver");
const StoryTypes = __importStar(require("./story.types.gql"));
const StoryArgs = __importStar(require("./story.args.gql"));
class StorySchema {
    storyResolver;
    constructor() {
        this.storyResolver = story_resolver_1.storyResolver;
    }
    registerQuery() {
        return {
            getStories: {
                type: StoryTypes.GetStoriesResponse,
                args: StoryArgs.getStoriesArgs,
                resolve: this.storyResolver.getStories
            },
            watchStory: {
                type: StoryTypes.StoryMessageResponse,
                args: StoryArgs.watchStoryArgs,
                resolve: this.storyResolver.watchStory
            },
            getUserStories: {
                type: StoryTypes.GetUserStoriesResponse,
                args: StoryArgs.getUserStoriesArgs,
                resolve: this.storyResolver.getUserStories
            },
            getViewerAndReactsStories: {
                type: StoryTypes.GetViewerAndReactsStoriesResponse,
                args: StoryArgs.getViewerAndReactsStoriesArgs,
                resolve: this.storyResolver.getViewerAndReactsStories
            },
        };
    }
    registerMutation() {
        return {
            createStory: {
                type: StoryTypes.OneStoryType,
                args: StoryArgs.createStoryArgs,
                resolve: this.storyResolver.createStory
            },
            updateStory: {
                type: StoryTypes.OneStoryType,
                args: StoryArgs.updateStoryArgs,
                resolve: this.storyResolver.updateStory
            },
            deleteStory: {
                type: StoryTypes.StoryMessageResponse,
                args: StoryArgs.deleteStoryArgs,
                resolve: this.storyResolver.deleteStory
            },
        };
    }
}
exports.StorySchema = StorySchema;
exports.storySchema = new StorySchema();
