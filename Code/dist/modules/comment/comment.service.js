"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const service_1 = require("../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const ObjectId_1 = require("../../common/utils/ObjectId");
const enum_1 = require("../../common/enum");
const post_1 = require("../../common/utils/post");
class CommentService {
    postRepository;
    userRepository;
    reactRepository;
    commentRepository;
    NotificationRepository;
    redis;
    s3;
    notification;
    constructor() {
        this.userRepository = new Repository_1.UserRepository();
        this.postRepository = new Repository_1.PostRepository();
        this.NotificationRepository = new Repository_1.NotificationRepository();
        this.commentRepository = new Repository_1.CommentRepository();
        this.reactRepository = new Repository_1.ReactRepository();
        this.redis = service_1.redisService;
        this.s3 = service_1.s3Service;
        this.notification = service_1.notificationService;
    }
    async cleanAssets(attachments) {
        try {
            if (attachments.length) {
                await this.s3.deleteAssets({ Keys: attachments.map((Key) => ({ Key })) });
            }
        }
        catch (error) {
            console.log(error);
            throw new exception_1.BadRequestException("Fail to delete all attachments of comment");
        }
    }
    async createComment(user, data) {
        const postId = (0, ObjectId_1.TransformToObjectId)(data.postId);
        const PostExist = await this.postRepository.findOne({
            filter: {
                deletedAt: { $exists: false },
                _id: postId,
                $or: (0, post_1.getAvalibilaty)(user)
            }
        });
        if (!PostExist) {
            throw new exception_1.NotFoundException("This Post Not Exist");
        }
        const comment = await this.commentRepository.create({ data: { ...data, userId: user._id, postId } });
        const tokens = await this.redis.getFCMs(user._id);
        await this.notification.sendNotifications({ tokens, data: { title: `${user.userName} commented on your post`, body: `${comment.content?.slice(0, 20)}` } });
        await this.NotificationRepository.create({ data: { recipientId: PostExist.userId, senderId: user._id, title: `${user.userName} commented on your post`, referenceId: comment._id, referenceModel: enum_1.notificationModelEnum.COMMENT, body: JSON.stringify({ content: comment.content, attachments: comment.attachments || {} }) } });
        return comment;
    }
    async replyComment(user, data) {
        const commentId = (0, ObjectId_1.TransformToObjectId)(data.commentId);
        const postId = (0, ObjectId_1.TransformToObjectId)(data.postId);
        const PostExist = await this.postRepository.findOne({
            filter: {
                deletedAt: { $exists: false },
                _id: postId,
                $or: (0, post_1.getAvalibilaty)(user)
            }
        });
        if (!PostExist) {
            throw new exception_1.NotFoundException("This Post Not Exist");
        }
        const commentExist = await this.commentRepository.findById({ _id: commentId });
        if (!commentExist) {
            throw new exception_1.NotFoundException("This comment not exist");
        }
        const newComment = await this.commentRepository.create({ data: { ...data, postId, parentComment: commentId, userId: user._id } });
        return newComment;
    }
    async getAllComments(user, query) {
        const postId = (0, ObjectId_1.TransformToObjectId)(query.postId);
        const limit = Number(query?.limit) || 5;
        const cursor = query?.cursor;
        const filter = { postId: postId, deletedAt: { $exists: false } };
        if (cursor) {
            filter._id = { $le: (0, ObjectId_1.TransformToObjectId)(cursor) };
        }
        const allCommentsRelatedByPost = await this.commentRepository.aggregate([
            {
                $match: filter
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "posts",
                    let: { postId: "$postId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$postId"] },
                                        { $eq: ["$userId", user._id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "post"
                }
            },
            {
                $match: { post: { $ne: [] } }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    "user.email": 0,
                    "user.password": 0,
                    "user.provider": 0,
                    "user.role": 0,
                    "user.DOB": 0,
                    "user.gender": 0,
                    "user.updatedAt": 0,
                    "user.__v": 0,
                    "user.confirmedAt": 0,
                    "user.friends": 0,
                    "user.friendsRequest": 0,
                }
            },
            {
                $unwind: "$user"
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        return allCommentsRelatedByPost;
    }
    async getComment(user, { commentId, postId }) {
        const PostId = (0, ObjectId_1.TransformToObjectId)(postId);
        const CommentId = (0, ObjectId_1.TransformToObjectId)(commentId);
        const PostExist = await this.postRepository.findById({ _id: PostId });
        if (!PostExist) {
            throw new exception_1.NotFoundException("This Post Not Exist");
        }
        const comment = await this.commentRepository.findOne({ filter: { _id: CommentId, postId: PostId } });
        if (!comment) {
            throw new exception_1.NotFoundException("This comment not exist");
        }
        return comment;
    }
    async updateComment(user, data) {
        const commentId = (0, ObjectId_1.TransformToObjectId)(data.commentId);
        const postId = (0, ObjectId_1.TransformToObjectId)(data.postId);
        const PostExist = await this.postRepository.findOne({
            filter: {
                deletedAt: { $exists: false },
                _id: postId,
                $or: (0, post_1.getAvalibilaty)(user)
            }
        });
        if (!PostExist) {
            throw new exception_1.NotFoundException("This Post Not Exist");
        }
        const comment = await this.commentRepository.findOne({ filter: { _id: commentId, postId, userId: user._id } });
        if (!comment) {
            throw new exception_1.NotFoundException("This comment not exist");
        }
        let removedImages = [];
        let removedVideos = [];
        if (data.attachments?.image.length) {
            const oldImage = comment.attachments?.image || [];
            const newImage = data.attachments.image || oldImage;
            removedImages = oldImage?.filter((img) => { {
                !newImage.includes(img);
            } });
        }
        if (data.attachments?.video.length) {
            const oldvideo = comment.attachments?.video || [];
            const newvideo = comment.attachments?.video || oldvideo;
            removedVideos = oldvideo.filter((vid) => { !newvideo.includes(vid); });
        }
        const removedAssets = [...removedImages, ...removedVideos];
        if (removedAssets.length > 0) {
            void this.cleanAssets(removedAssets);
        }
        const updatedComment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId, postId, userId: user._id },
            update: {
                $set: {
                    content: data.content ?? comment.content,
                    mentions: data.mentions ?? comment.mentions,
                    attachments: { image: data.attachments?.image ?? comment.attachments?.image, video: data.attachments?.video ?? comment.attachments?.video }
                }
            }
        });
        if (!updatedComment) {
            throw new exception_1.BadRequestException("Fail to update comment");
        }
        return updatedComment;
    }
    async deleteComment(user, data) {
        const commentId = (0, ObjectId_1.TransformToObjectId)(data.commentId);
        const postId = (0, ObjectId_1.TransformToObjectId)(data.postId);
        const postExist = await this.postRepository.findOne({ filter: { deletedAt: { $exists: false }, _id: postId, $or: (0, post_1.getAvalibilaty)(user) } });
        if (!postExist) {
            throw new exception_1.NotFoundException("This Post Not Exist");
        }
        const comment = await this.commentRepository.findOne({ filter: { _id: commentId, postId, $or: [{ userId: user._id }, { userId: postExist.userId }] }
        });
        if (!comment) {
            throw new exception_1.NotFoundException("This comment Not exist");
        }
        const attachments = [
            ...(comment.attachments?.image || []),
            ...(comment.attachments?.video || [])
        ];
        await Promise.all([
            this.cleanAssets(attachments),
            this.NotificationRepository.deleteMany({ filter: { referenceId: comment._id, referenceModel: "Comment" } }),
            this.reactRepository.deleteMany({ filter: { targetId: comment._id, targetType: "Comment" } }),
            this.commentRepository.deleteOne({ filter: { _id: comment._id } })
        ]);
        return "Deleted successfully";
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
