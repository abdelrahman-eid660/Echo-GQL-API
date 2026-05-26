"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterServer = exports.RateLimiterServer = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_service_1 = require("./redis.service");
class RateLimiterServer {
    globalLimiter;
    userLimiter;
    postLimiter;
    commentLimiter;
    storyLimiter;
    redis;
    constructor() {
        this.redis = redis_service_1.redisService;
        const redisNativeClient = this.redis.nativeClient;
        this.globalLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisNativeClient,
            keyPrefix: "rl:Global",
            useRedisPackage: require('redis'),
            points: 100,
            duration: 60
        });
        this.userLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisNativeClient,
            keyPrefix: "rl:User",
            useRedisPackage: require('redis'),
            points: 15,
            duration: 60
        });
        this.postLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisNativeClient,
            keyPrefix: "rl:Post",
            useRedisPackage: require('redis'),
            points: 20,
            duration: 60
        });
        this.commentLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisNativeClient,
            keyPrefix: "rl:Comment",
            useRedisPackage: require('redis'),
            points: 10,
            duration: 60
        });
        this.storyLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisNativeClient,
            keyPrefix: "rl:Story",
            useRedisPackage: require('redis'),
            points: 5,
            duration: 60
        });
    }
    consumeGlobal = async (ip) => {
        await this.globalLimiter.consume(ip);
    };
    consumeUserAction = async (userId) => {
        await this.userLimiter.consume(userId.toString());
    };
    consumePostAction = async (userId) => {
        await this.postLimiter.consume(userId.toString());
    };
    consumeCommentAction = async (userId) => {
        await this.commentLimiter.consume(userId.toString());
    };
    consumeStoryAction = async (userId) => {
        await this.storyLimiter.consume(userId.toString());
    };
}
exports.RateLimiterServer = RateLimiterServer;
exports.rateLimiterServer = new RateLimiterServer();
