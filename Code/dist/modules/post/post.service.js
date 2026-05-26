"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const service_1 = require("../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const ObjectId_1 = require("../../common/utils/ObjectId");
const post_1 = require("../../common/utils/post");
class PostService {
    postRepository;
    userRepository;
    reactRepository;
    commentRepository;
    notificationRepository;
    notification;
    redis;
    s3;
    constructor() {
        this.userRepository = new Repository_1.UserRepository();
        this.postRepository = new Repository_1.PostRepository();
        this.reactRepository = new Repository_1.ReactRepository();
        this.commentRepository = new Repository_1.CommentRepository();
        this.notificationRepository = new Repository_1.NotificationRepository();
        this.s3 = new service_1.S3Service();
        this.notification = service_1.notificationService;
        this.redis = service_1.redisService;
    }
    async sendNotification(user) {
        try {
            const tokens = await this.redis.getFCMs(user._id);
            await this.notification.sendNotifications({ tokens, data: { title: "Your post has been successfully published", body: "✅" } });
        }
        catch (err) {
            console.error(err);
            throw new exception_1.BadRequestException(`Fail to send Notification`, { error: err });
        }
    }
    async cleanupPost(postId) {
        try {
            await Promise.all([
                this.commentRepository.deleteMany({ filter: { postId } }),
                this.reactRepository.deleteMany({ filter: { targetId: postId, targetType: "Post" } }),
                this.notificationRepository.deleteMany({ filter: { referenceId: postId, referenceModel: "Post" } })
            ]);
        }
        catch (err) {
            console.error(err);
            throw new exception_1.BadRequestException(`Fail to delete all`, { error: err });
        }
    }
    async createPost(user, data) {
        const { mentions, tags } = data;
        const mentionedUsers = await this.userRepository.find({ filter: { _id: { $in: mentions } } });
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new exception_1.NotFoundException("Some mentioned users are invalid");
        }
        const taggedUsers = await this.userRepository.find({ filter: { _id: { $in: tags } } });
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new exception_1.NotFoundException("Some tagged users are invalid");
        }
        const post = await this.postRepository.create({ data: { ...data, userId: user._id } });
        void this.sendNotification(user);
        return post;
    }
    async updatePost(user, data, postId) {
        const { mentions, tags, content, attachments } = data;
        const post = await this.postRepository.findOne({ filter: { _id: (0, ObjectId_1.TransformToObjectId)(postId), userId: user._id } });
        if (!post) {
            throw new exception_1.NotFoundException("Can't found this post");
        }
        if (!content && !post.content && !attachments?.image?.length && !attachments?.video?.length && !post.attachments?.image?.length && !post.attachments?.video?.length) {
            throw new exception_1.BadRequestException("We can't leave empty post");
        }
        const mentionedUsers = await this.userRepository.find({ filter: { _id: { $in: mentions } } });
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new exception_1.NotFoundException("Some mentioned users are invalid");
        }
        const taggedUsers = await this.userRepository.find({ filter: { _id: { $in: tags } } });
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new exception_1.NotFoundException("Some tagged users are invalid");
        }
        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: { _id: (0, ObjectId_1.TransformToObjectId)(postId), userId: user._id },
            update: {
                $set: {
                    content: content ?? post?.content,
                    availability: data.availability ?? post?.availability,
                    tags: (data.tags || []).map(id => (0, ObjectId_1.TransformToObjectId)(id)) ?? post.tags,
                    mentions: (data.mentions || []).map(id => (0, ObjectId_1.TransformToObjectId)(id)) ?? post.mentions,
                    attachments: {
                        image: attachments?.image || post?.attachments?.image,
                        video: attachments?.video || post?.attachments?.video
                    }
                }
            }
        });
        if (!updatePost) {
            throw new exception_1.NotFoundException("Fail to update this post");
        }
        const oldImages = post.attachments?.image || [];
        const newImages = data.attachments?.image || oldImages;
        const removedImages = oldImages.filter((img) => !newImages.includes(img));
        if (removedImages.length) {
            void this.s3.deleteAssets({ Keys: removedImages.map((key) => ({ Key: key })) });
        }
        const oldVideo = post.attachments?.video;
        const newVideo = data.attachments?.video;
        const removedVideo = oldVideo.filter(vid => !newVideo?.includes(vid));
        if (removedVideo.length) {
            void this.s3.deleteAssets({ Keys: removedVideo.map((Key) => ({ Key })) });
        }
        return updatePost;
    }
    async getPosts(user, query) {
        const limit = Number(query.limit) || 5;
        const cursor = query.cursor;
        let filter = {
            deletedAt: { $exists: false },
            $or: (0, post_1.getAvalibilaty)(user)
        };
        if (cursor) {
            filter._id = { $lt: (0, ObjectId_1.TransformToObjectId)(cursor) };
        }
        const posts = await this.postRepository.aggregate([
            {
                $match: filter
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] }
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                profileImage: 1,
                                userName: 1,
                            }
                        },
                    ],
                    as: "Publisher",
                }
            },
            {
                $unwind: {
                    path: "$Publisher",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;
        return { posts, nextCursor, hasMore: posts.length === limit };
    }
    async getPost(user, { postId }) {
        const [post] = await this.postRepository.aggregate([
            {
                $match: { _id: (0, ObjectId_1.TransformToObjectId)(postId) }
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] }
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                profileImage: 1,
                                userName: 1,
                            }
                        },
                    ],
                    as: "Publisher",
                }
            },
            {
                $unwind: {
                    path: "$Publisher",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);
        if (!post) {
            throw new exception_1.NotFoundException("This post not Exist");
        }
        return post;
    }
    async deletePost(user, { postId, force }) {
        const post = await this.postRepository.findOneAndDelete({ filter: { userId: user._id, _id: (0, ObjectId_1.TransformToObjectId)(postId) }, options: { force: force } });
        if (!post) {
            throw new exception_1.NotFoundException("This post not Exist");
        }
        void this.cleanupPost((0, ObjectId_1.TransformToObjectId)(postId));
        return `Post deleted successfuly`;
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
