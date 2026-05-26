"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyService = exports.StoryService = void 0;
const service_1 = require("../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const ObjectId_1 = require("../../common/utils/ObjectId");
const post_1 = require("../../common/utils/post");
const enum_1 = require("../../common/enum");
class StoryService {
    userRepository;
    storyRepository;
    reactRepository;
    notification;
    NotificationRepository;
    redis;
    s3;
    constructor() {
        this.userRepository = new Repository_1.UserRepository();
        this.storyRepository = new Repository_1.StoryRepository();
        this.reactRepository = new Repository_1.ReactRepository();
        this.NotificationRepository = new Repository_1.NotificationRepository();
        this.notification = service_1.notificationService;
        this.redis = service_1.redisService;
        this.s3 = service_1.s3Service;
    }
    async cleanupStoryData(Keys, story) {
        try {
            await this.s3.deleteAssets({ Keys });
            await this.NotificationRepository.deleteOne({ filter: { referenceId: story._id, referenceModel: enum_1.notificationModelEnum.STORY } });
            await this.redis.removeStoryUser(story._id);
        }
        catch (error) {
            console.log(error);
            throw new exception_1.BadRequestException("Fail to delete all story attachments from S3 or notification or story cash redis");
        }
    }
    async createStory(user, data) {
        const { mentions, tags } = data;
        const mentionedUsers = await this.userRepository.find({ filter: { _id: { $in: mentions } } });
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new exception_1.NotFoundException("Some mentioned users are invalid");
        }
        const taggedUsers = await this.userRepository.find({ filter: { _id: { $in: tags } } });
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new exception_1.NotFoundException("Some tagged users are invalid");
        }
        const story = await this.storyRepository.create({ data: { ...data, userId: user._id } });
        const tokens = await this.redis.getFCMs(user._id);
        if (tokens) {
            void this.notification.sendNotifications({ tokens, data: { title: "Your story has been successfully published", body: "✅" } });
        }
        if (user.friends?.length) {
            const friendsTokens = await this.redis.getFCMsMulti(user.friends);
            if (friendsTokens.length) {
                void this.notification.sendNotifications({ tokens: friendsTokens, data: { title: `${user.userName} published a new story`, body: "✅" } });
                void this.NotificationRepository.create({ data: user.friends.map((friendId) => ({ senderId: user.id, recipientId: friendId, title: `${user.userName} publish a new story`, body: "✅", referenceModel: enum_1.notificationModelEnum.STORY, referenceId: story._id })) });
            }
        }
        return story;
    }
    async updateStory(user, data) {
        const { mentions } = data;
        const story = await this.storyRepository.findOne({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(data.storyId), userId: user._id } });
        if (!story) {
            throw new exception_1.NotFoundException("Can't found this story");
        }
        const mentionedUsers = await this.userRepository.find({ filter: { _id: { $in: data.mentions } } });
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new exception_1.NotFoundException("Some mentioned users are invalid");
        }
        const updatestory = await this.storyRepository.findOneAndUpdate({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(data.storyId), userId: user._id },
            update: {
                $set: {
                    availability: data.availability ?? story?.availability,
                    mentions: data.mentions !== undefined ? (data.mentions).map(id => (0, ObjectId_1.TransformToObjectId)(id)) : story.mentions,
                }
            }
        });
        if (!updatestory) {
            throw new exception_1.NotFoundException("Fail to update this story");
        }
        return updatestory;
    }
    async getStories(user, query) {
        let filter = {
            $or: (0, post_1.getAvalibilaty)(user), expiresAt: { $gt: new Date() }
        };
        if (query.cursor) {
            filter._id = { $le: (0, ObjectId_1.TransformToObjectId)(query.cursor) };
        }
        const stories = await this.storyRepository.find({ filter, options: { limit: query.limit ?? 5, sort: { createdAt: -1 }, populate: [{ path: "userId", select: "firstName lastName profileImage" }] } });
        if (!stories.length) {
            throw new exception_1.NotFoundException("There no't any stories");
        }
        const nextCursor = stories.length > 0 ? stories[stories?.length - 1]?._id : null;
        return { stories, nextCursor, hasMore: stories.length === query.limit };
    }
    async getUserStories(user, query) {
        let filter = {
            $or: (0, post_1.getAvalibilaty)(user), expiresAt: { $gt: new Date() }, userId: query.userId
        };
        const stories = await this.storyRepository.find({ filter, options: { populate: [{ path: "userId", select: "firstName lastName profileImage" }] } });
        if (!stories.length) {
            throw new exception_1.NotFoundException("There no't any stories");
        }
        const isOwner = user._id.toString() === query.userId;
        const storyIds = stories.map(s => s._id.toString());
        const [viewedMap, reacts, viewsMap] = await Promise.all([
            !isOwner ? this.redis.isViewedMulti(stories, user._id) : null,
            !isOwner ? this.reactRepository.find({ filter: { targetId: { $in: storyIds }, userId: user._id } }) : [],
            isOwner ? this.redis.viewersCountMulti(stories) : null,
        ]);
        const userReactsMap = new Map(reacts.map(r => [r.targetId.toString(), r.type]));
        return stories.map(story => {
            const idStr = story._id.toString();
            return {
                ...story.toObject(),
                isOwner,
                isViewed: viewedMap ? (viewedMap.get(idStr) || false) : true,
                viewsCount: viewsMap?.get(idStr) || 0,
                currentUserReact: userReactsMap ? (userReactsMap.get(idStr) || null) : null
            };
        });
    }
    async getViewerAndReactsStories(user, query) {
        const { storyId, userId } = query;
        const story = await this.storyRepository.findOne({ filter: { _id: storyId, userId } });
        if (!story) {
            throw new exception_1.NotFoundException("This story not exists");
        }
        if (user._id.toString() !== story?.userId.toString()) {
            throw new exception_1.UnauthorizedException("you can't access to theses data ");
        }
        const viewers = await this.redis.getViewersWithDate(storyId);
        const reacts = await this.reactRepository.find({ filter: { targetId: storyId }, options: { populate: [{ path: "userId", select: "firstName lastName profileImage" }] } });
        const users = await this.userRepository.find({ filter: { _id: { $in: viewers.map(u => u.value) } }, projection: "firstName lastName profileImage" });
        const reactsMap = new Map(reacts.map(react => [react.userId._id.toString(), react]));
        const usersMap = new Map(users.map(user => [user._id.toString(), user]));
        const groupedviewer = viewers.map(v => ({
            viewer: usersMap.get(v.value),
            reacts: reactsMap.get(v.value),
            viewedAt: new Date(v.score).toISOString(),
        }));
        return groupedviewer;
    }
    async watchStory(user, { storyId }) {
        const story = await this.storyRepository.findOne({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(storyId), $or: (0, post_1.getAvalibilaty)(user), expiresAt: { $gt: new Date() } }, options: { populate: [{ path: "userId", select: "firstName lastName profileImage" }] } });
        if (!story) {
            throw new exception_1.NotFoundException("This story not Exist");
        }
        if (user._id.toString() !== story?.userId?._id.toString()) {
            const isViewed = await this.redis.isViewed(story._id, user?._id);
            const storyId = this.redis.View_Key({ viewId: story._id });
            if (!isViewed) {
                await this.redis.addViewer(storyId, user?._id.toString(), Date.now());
            }
            return `Add view success`;
        }
        return 'You the owner';
    }
    async deleteStory(user, { storyId }) {
        const story = await this.storyRepository.findOneAndDelete({ filter: { userId: user._id, _id: (0, ObjectId_1.TransformToObjectId)(storyId) } });
        if (!story) {
            throw new exception_1.NotFoundException("This story not Exist");
        }
        const Keys = [
            ...(story.attachments?.image || [])?.map(Key => ({ Key })),
            ...(story.attachments?.video || [])?.map(Key => ({ Key }))
        ];
        void this.cleanupStoryData(Keys, story);
        return `Story deleted successfuly`;
    }
}
exports.StoryService = StoryService;
exports.storyService = new StoryService();
