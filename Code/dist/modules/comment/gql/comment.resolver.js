"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResolver = exports.CommentResolver = void 0;
const exception_1 = require("../../../common/exception");
const service_1 = require("../../../common/service");
const middleware_1 = require("../../../middleware");
const comment_service_1 = require("../comment.service");
const comment_validation_1 = require("../comment.validation");
class CommentResolver {
    commentService;
    rateLimitServer;
    constructor() {
        this.commentService = comment_service_1.commentService;
        this.rateLimitServer = service_1.rateLimiterServer;
    }
    createComment = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeCommentAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.creatCommentGQLValidation, args);
        const data = await comment_service_1.commentService.createComment(user, args);
        return data;
    };
    getComments = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.getAllCommentsGQLValidation, args);
        const data = await comment_service_1.commentService.getAllComments(user, args);
        return data;
    };
    getComment = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.getCommentGQLValidation, args);
        const data = await comment_service_1.commentService.getComment(user, args);
        return data;
    };
    replyComment = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeCommentAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.replyCommentGQLVliadation, args);
        const data = await comment_service_1.commentService.replyComment(user, args);
        return data;
    };
    updateComment = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeCommentAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.creatCommentGQLValidation, args);
        const data = await comment_service_1.commentService.updateComment(user, args);
        return data;
    };
    deleteComment = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(comment_validation_1.getCommentGQLValidation, args);
        const data = await comment_service_1.commentService.deleteComment(user, args);
        return { message: data };
    };
}
exports.CommentResolver = CommentResolver;
exports.commentResolver = new CommentResolver();
