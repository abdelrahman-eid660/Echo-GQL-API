"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = exports.viewRedisEnum = void 0;
const redis_enum_1 = require("./../enum/redis.enum");
const redis_1 = require("redis");
const config_1 = require("../../config/config");
var viewRedisEnum;
(function (viewRedisEnum) {
    viewRedisEnum["STORY"] = "story";
    viewRedisEnum["VIEW"] = "view";
})(viewRedisEnum || (exports.viewRedisEnum = viewRedisEnum = {}));
;
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: config_1.REDIS_URI,
        });
        this.handleEvents();
    }
    handleEvents() {
        this.client.on("connect", () => {
            console.log(`Redis connected Successfuly ❤️🌞`);
        });
        this.client.on("error", (error) => {
            console.log(`Fail to Connect Redis ❌ ${error}`);
        });
    }
    get nativeClient() {
        return this.client;
    }
    async connect() {
        await this.client.connect();
    }
    async set({ key, value, ttl, parse = false, }) {
        const Value = parse ? JSON.stringify(value) : value;
        if (ttl) {
            return await this.client.set(key, Value, { EX: ttl });
        }
        return await this.client.set(key, Value);
    }
    async get({ key, parse = false, }) {
        const data = await this.client.get(key);
        if (!data)
            return null;
        return parse ? JSON.parse(data) : data;
    }
    async deleteKey(key) {
        if (!key)
            return 0;
        return await this.client.del(key);
    }
    async exists(key) {
        return await this.client.exists(key);
    }
    async expire(key, ttl) {
        return await this.client.expire(key, ttl);
    }
    async ttl(key) {
        return await this.client.ttl(key);
    }
    async incr(key) {
        return await this.client.incr(key);
    }
    async mGet(keys) {
        if (!keys.length)
            return [];
        return await this.client.mGet(keys);
    }
    async keys(prefix) {
        return await this.client.keys(`${prefix}*`);
    }
    async sadd(key, value) {
        return await this.client.sAdd(key, value);
    }
    async sismember(key, value) {
        const result = await this.client.sIsMember(key, value);
        return result === 1;
    }
    async smembers(key) {
        const result = await this.client.sMembers(key);
        return result;
    }
    RevokeSingleTokenKey(userId, jti) {
        return `revoke:${userId}:${jti}`;
    }
    RevokeTokenKey(userId) {
        return `revoke:${userId}`;
    }
    RevokeAllTokenKey(userId) {
        return `revoke_all:${userId}`;
    }
    baseRedis({ type = redis_enum_1.RedisTypeEnum.CONFIRMEMAIL, key = redis_enum_1.RedisActionsEnum.REQUEST, action, blockAction, }) {
        return blockAction
            ? `${type}::${key}::${blockAction}`
            : action
                ? `${type}::${key}::${action}`
                : `${type}::${key}`;
    }
    baseProfileRedis(key) {
        return `profile::view::${key}`;
    }
    RedisKey(params = {}) {
        return this.baseRedis(params);
    }
    RedisMaxRequestKey(params = {}) {
        return this.baseRedis(params);
    }
    RedisBlockKey(params = {}) {
        return this.baseRedis(params);
    }
    FCM_Key(userId) {
        return `user:FCM:${userId}`;
    }
    async addFCM(userId, FCMToken) {
        return await this.client.sAdd(this.FCM_Key(userId), FCMToken);
    }
    async removeFCM(userId, FCMToken) {
        return await this.client.sRem(this.FCM_Key(userId), FCMToken);
    }
    async getFCMs(userId) {
        return await this.client.sMembers(this.FCM_Key(userId));
    }
    async hasFCMs(userId) {
        return await this.client.sCard(this.FCM_Key(userId));
    }
    async removeFCMUser(userId) {
        return await this.client.del(this.FCM_Key(userId));
    }
    async getFCMsMulti(users) {
        const multi = this.client.multi();
        for (const id of users) {
            multi.sMembers(this.FCM_Key(id.toString()));
        }
        const results = await multi.exec();
        return results.flat().filter(Boolean);
    }
    View_Key({ viewId, type = viewRedisEnum.STORY }) {
        return `user:${type}:${viewId}`;
    }
    async addViewer(targetId, viewerId, viewedAt) {
        return await this.client.zAdd(targetId.toString(), {
            score: viewedAt,
            value: viewerId,
        });
    }
    async removeViewer(targetId, viewerId) {
        return await this.client.zRem(targetId.toString(), viewerId);
    }
    async getViewers(targetId) {
        return await this.client.zRange(targetId.toString(), 0, -1, {
            REV: true,
        });
    }
    async getViewersWithDate(targetId) {
        return await this.client.zRangeWithScores(targetId.toString(), 0, -1);
    }
    async isViewed(targetId, viewerId) {
        const result = await this.client.zScore(targetId.toString(), viewerId.toString());
        return result !== null;
    }
    async viewerCount(targetId) {
        return await this.client.zCard(targetId.toString());
    }
    async removeStoryUser(targetId) {
        return await this.client.del(targetId.toString());
    }
    async isViewedMulti(stories, viewerId, type = viewRedisEnum.STORY) {
        const multi = this.client.multi();
        for (const story of stories) {
            const key = this.View_Key({ viewId: story._id.toString(), type });
            multi.zScore(key, viewerId.toString());
        }
        const results = await multi.exec();
        return new Map(stories.map((story, index) => {
            const score = results ? results[index] : null;
            return [story._id.toString(), score !== null && score !== undefined];
        }));
    }
    async viewersCountMulti(stories, type = viewRedisEnum.STORY) {
        const multi = this.client.multi();
        for (const story of stories) {
            const key = this.View_Key({ viewId: story._id.toString(), type });
            multi.zCard(key);
        }
        const results = await multi.exec();
        return new Map(stories.map((story, index) => [
            story._id.toString(), Number(results[index]),
        ]));
    }
    socket_Key(userId) {
        return `user:socket:${userId}`;
    }
    async addSocktId(userId, socketId, createdAt) {
        return await this.client.zAdd(this.socket_Key(userId), {
            score: createdAt,
            value: socketId,
        });
    }
    async removeSocktId(userId, socketId) {
        return await this.client.zRem(this.socket_Key(userId), socketId);
    }
    async getSocktIds(userId) {
        return await this.client.zRange(this.socket_Key(userId), 0, -1, {
            REV: true,
        });
    }
    async getSocktIdsWithDate(userId) {
        return await this.client.zRangeWithScores(this.socket_Key(userId), 0, -1);
    }
    async socktIdCount(userId) {
        return await this.client.zCard(this.socket_Key(userId));
    }
    async removeUserSocket(userId) {
        return await this.client.del(this.socket_Key(userId));
    }
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
