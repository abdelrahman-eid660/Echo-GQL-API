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
exports.commentSchema = exports.CommentSchema = void 0;
const graphql_1 = require("graphql");
const commentGQLArgs = __importStar(require("./comment.args.gql"));
const comment_resolver_1 = require("./comment.resolver");
const commentGQLTypes = __importStar(require("./comment.types.gql"));
class CommentSchema {
    commentResolver;
    constructor() {
        this.commentResolver = comment_resolver_1.commentResolver;
    }
    registerQuery() {
        return {
            comments: {
                type: new graphql_1.GraphQLList(commentGQLTypes.commentGQLTypes),
                args: commentGQLArgs.commentGQLArgs,
                resolve: this.commentResolver.getComments
            },
            getComment: {
                type: commentGQLTypes.commentGQLTypes,
                args: commentGQLArgs.getCommentGQLArgs,
                resolve: this.commentResolver.getComment
            }
        };
    }
    registerMutation() {
        return {
            replyComment: {
                type: commentGQLTypes.commentGQLTypes,
                args: commentGQLArgs.createCommentGQLArgs,
                resolve: comment_resolver_1.commentResolver.replyComment,
            },
            createComment: {
                type: commentGQLTypes.commentGQLTypes,
                args: commentGQLArgs.createCommentGQLArgs,
                resolve: comment_resolver_1.commentResolver.createComment,
            },
            updateComment: {
                type: commentGQLTypes.commentGQLTypes,
                args: commentGQLArgs.createCommentGQLArgs,
                resolve: comment_resolver_1.commentResolver.updateComment,
            },
            deleteComment: {
                type: commentGQLTypes.deleteGQLTypes,
                args: commentGQLArgs.getCommentGQLArgs,
                resolve: comment_resolver_1.commentResolver.deleteComment,
            }
        };
    }
}
exports.CommentSchema = CommentSchema;
exports.commentSchema = new CommentSchema();
