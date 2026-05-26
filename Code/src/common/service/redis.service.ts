import { RedisTypeEnum, RedisActionsEnum } from "./../enum/redis.enum";
import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { Types } from "mongoose";
import { IStory } from "../interface";
type RedisKeyParams = {
  type?: string;
  key?: string;
  action?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
  blockAction?:
    | (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum]
    | undefined;
};

type SetParams<T = any> = {
  key: string;
  value: T;
  ttl?: number;
  parse?: boolean;
};

type GetParams = {
  key: string;
  parse?: boolean;
};
export enum viewRedisEnum  {
  STORY =  "story",
  VIEW = "view"
};

export class RedisService {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: REDIS_URI,
    });
    this.handleEvents();
  }
  private handleEvents() {
    this.client.on("connect", () => {
      console.log(`Redis connected Successfuly ❤️🌞`);
    });
    this.client.on("error", (error) => {
      console.log(`Fail to Connect Redis ❌ ${error}`);
    });
  }
  public get nativeClient(): RedisClientType {
  return this.client;
}

  async connect() {
    await this.client.connect();
  }
  //======================== Set ==========================
  async set<T>({
    key,
    value,
    ttl,
    parse = false,
  }: SetParams<T>): Promise<string | null> {
    const Value = parse ? JSON.stringify(value) : (value as any);

    if (ttl) {
      return await this.client.set(key, Value, { EX: ttl });
    }

    return await this.client.set(key, Value);
  }

  //======================== Get ==========================
  async get<T = any>({
    key,
    parse = false,
  }: GetParams): Promise<T | string | null> {
    const data = await this.client.get(key);

    if (!data) return null;

    return parse ? (JSON.parse(data) as T) : data;
  }

  //======================== Delete =======================
  async deleteKey(key: string | string[]): Promise<number> {
    if (!key) return 0;
    return await this.client.del(key);
  }

  //======================== Exists =======================
  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  //======================== Expire =======================
  async expire(key: string, ttl: number): Promise<number> {
    return await this.client.expire(key, ttl);
  }

  //======================== TTL ==========================
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  //======================== Incr =========================
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  //======================== mGet =========================
  async mGet(keys: string[]): Promise<(string | null)[]> {
    if (!keys.length) return [];
    return await this.client.mGet(keys);
  }

  //======================== Keys =========================
  async keys(prefix: string): Promise<string[]> {
    return await this.client.keys(`${prefix}*`);
  }
  //======================== SADD =========================
  async sadd(key: string, value: string): Promise<number> {
    return await this.client.sAdd(key, value);
  }

  //======================== SISMEMBER ====================
  async sismember(key: string, value: string): Promise<boolean> {
    const result = await this.client.sIsMember(key, value);
    return result === 1;
  }
  //======================== SISMEMBER ====================
  async smembers(key: string): Promise<string[]> {
    const result = await this.client.sMembers(key);
    return result;
  }

  //======================== Login out ======================
  RevokeSingleTokenKey(userId: string | Types.ObjectId, jti: string): string {
    return `revoke:${userId}:${jti}`;
  }
  RevokeTokenKey(userId: string | Types.ObjectId): string {
    return `revoke:${userId}`;
  }

  RevokeAllTokenKey(userId: string | Types.ObjectId): string {
    return `revoke_all:${userId}`;
  }
  //======================== attampet Formate ====================

  baseRedis({
    type = RedisTypeEnum.CONFIRMEMAIL,
    key = RedisActionsEnum.REQUEST,
    action,
    blockAction,
  }: RedisKeyParams): string {
    return blockAction
      ? `${type}::${key}::${blockAction}`
      : action
        ? `${type}::${key}::${action}`
        : `${type}::${key}`;
  }

  baseProfileRedis(key: string): string {
    return `profile::view::${key}`;
  }

  RedisKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }

  RedisMaxRequestKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }

  RedisBlockKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }

  //===================== Notification ====================
  FCM_Key(userId: Types.ObjectId | string) {
    return `user:FCM:${userId}`;
  }

  async addFCM(userId: Types.ObjectId | string, FCMToken: string) {
    return await this.client.sAdd(this.FCM_Key(userId), FCMToken);
  }

  async removeFCM(userId: Types.ObjectId | string, FCMToken: string) {
    return await this.client.sRem(this.FCM_Key(userId), FCMToken);
  }

  async getFCMs(userId: Types.ObjectId | string) {
    return await this.client.sMembers(this.FCM_Key(userId));
  }

  async hasFCMs(userId: Types.ObjectId | string) {
    return await this.client.sCard(this.FCM_Key(userId));
  }

  async removeFCMUser(userId: Types.ObjectId | string) {
    return await this.client.del(this.FCM_Key(userId));
  }
  async getFCMsMulti(users: (Types.ObjectId | string)[]) {
    const multi = this.client.multi();
    for (const id of users) {
      multi.sMembers(this.FCM_Key(id.toString()));
    }
    const results = await multi.exec();
    return results.flat().filter(Boolean);
  }
  //==================== viewer ====================
  View_Key({viewId ,  type = viewRedisEnum.STORY} : {viewId : Types.ObjectId | string , type?  : viewRedisEnum}) {
    return `user:${type}:${viewId}`;
  }
  async addViewer(
    targetId: Types.ObjectId | string,
    viewerId: string,
    viewedAt: number,
  ) {
    return await this.client.zAdd(targetId.toString(), {
      score: viewedAt,
      value: viewerId,
    });
  }
  async removeViewer(targetId: Types.ObjectId | string, viewerId:  string) {
    return await this.client.zRem(targetId.toString(), viewerId);
  }
  async getViewers(targetId: Types.ObjectId | string) {
    return await this.client.zRange(targetId.toString(), 0, -1, {
      REV: true,
    }); // for sorting oldest to newlest
  }
  async getViewersWithDate(targetId: Types.ObjectId | string) {
    return await this.client.zRangeWithScores(targetId.toString(), 0, -1); // for sorting oldest to newlest
  }
  async isViewed(targetId: Types.ObjectId | string, viewerId: Types.ObjectId) {
    const result = await this.client.zScore(targetId.toString(), viewerId.toString());
    return result !== null;
  }
  async viewerCount(targetId: Types.ObjectId | string) {
    return await this.client.zCard(targetId.toString());
  }
  async removeStoryUser(targetId: Types.ObjectId | string) {
    return await this.client.del(targetId.toString());
  }
  async isViewedMulti( stories: IStory[],viewerId: Types.ObjectId , type : viewRedisEnum = viewRedisEnum.STORY): Promise<Map<string, boolean>> {
    const multi = this.client.multi();
    for (const story of stories) {
    const key = this.View_Key({viewId : story._id.toString() , type})
      multi.zScore(key, viewerId.toString());
    }
    const results = await multi.exec();
    return new Map(stories.map((story, index) => {
        const score = results ? results[index] : null;
        return [ story._id.toString(), score !== null && score !== undefined];
      }),
    );
  }
  async viewersCountMulti(stories: IStory[] , type: viewRedisEnum = viewRedisEnum.STORY) {
    const multi = this.client.multi();
    for (const story of stories) {
      const key = this.View_Key({ viewId: story._id.toString(), type });
      multi.zCard(key);
    }
    const results = await multi.exec();
    return new Map(stories.map((story, index) => [
      story._id.toString(),Number(results[index]),
      ]),
    );
  }
  //===================== socket ====================
  socket_Key(userId: Types.ObjectId | string) {
    return `user:socket:${userId}`;
  }

  async addSocktId(
    userId: Types.ObjectId | string,
    socketId: string,
    createdAt: number,
  ) {
    return await this.client.zAdd(this.socket_Key(userId), {
      score: createdAt,
      value: socketId,
    });
  }

  async removeSocktId(userId: Types.ObjectId | string, socketId: string) {
    return await this.client.zRem(this.socket_Key(userId), socketId);
  }

  async getSocktIds(userId: Types.ObjectId | string) {
    return await this.client.zRange(this.socket_Key(userId), 0, -1, {
      REV: true,
    }); // for sorting oldest to newlest
  }
  async getSocktIdsWithDate(userId: Types.ObjectId | string) {
    return await this.client.zRangeWithScores(this.socket_Key(userId), 0, -1); // for sorting oldest to newlest
  }

  async socktIdCount(userId: Types.ObjectId | string) {
    return await this.client.zCard(this.socket_Key(userId));
  }

  async removeUserSocket(userId: Types.ObjectId | string) {
    return await this.client.del(this.socket_Key(userId));
  }
}

export const redisService = new RedisService();
