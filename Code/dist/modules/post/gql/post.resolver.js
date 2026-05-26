"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const post_service_1 = require("../post.service");
const middleware_1 = require("../../../middleware");
const post_auth_1 = require("../post.auth");
const post_validation_1 = require("../post.validation");
const service_1 = require("../../../common/service");
const exception_1 = require("../../../common/exception");
class PostResolver {
    postService;
    rateLimitServer;
    constructor() {
        this.postService = post_service_1.postService;
        this.rateLimitServer = service_1.rateLimiterServer;
    }
    createPost = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumePostAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.isAuthorized)(post_auth_1.endPoint.GeneralAuth, user);
        await (0, middleware_1.GraphQLValidation)(post_validation_1.creatPost, args);
        const data = await this.postService.createPost(user, args);
        return data;
    };
    getPosts = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(post_validation_1.getPostsGQL, args);
        const { hasMore, nextCursor, posts } = await this.postService.getPosts(user, args);
        return { data: { posts, nextCursor, hasMore } };
    };
    getPost = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const resualt = await this.postService.getPost(user, args);
        return { data: { post: resualt } };
    };
    updatePost = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumePostAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        const resualt = await this.postService.updatePost(user, args.data, args.postId);
        return resualt;
    };
    deletePost = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const resualt = await this.postService.deletePost(user, args);
        return { message: resualt };
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
