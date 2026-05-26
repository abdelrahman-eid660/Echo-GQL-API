import { HydratedDocument, Types } from 'mongoose';
import { NotificationService, notificationService, redisService, RedisService, S3Service } from '../../common/service';
import { CommentRepository, NotificationRepository, ReactRepository, UserRepository , PostRepository } from '../../DB/Repository';
import { BadRequestException, NotFoundException } from '../../common/exception';
import { IUser , IPost } from '../../common/interface';
import { TransformToObjectId } from '../../common/utils/ObjectId';
import { createPostDTO, getPostDTO, getPostsDTO } from './post.dto';
import { getAvalibilaty } from '../../common/utils/post';
export class PostService {
    private readonly postRepository : PostRepository
    private readonly userRepository : UserRepository
    private readonly reactRepository : ReactRepository
    private readonly commentRepository : CommentRepository
    private readonly notificationRepository: NotificationRepository;
    private readonly notification: NotificationService;
    private readonly redis: RedisService;
    private s3 : S3Service
    constructor(){
        this.userRepository = new UserRepository()
        this.postRepository = new PostRepository()
        this.reactRepository = new ReactRepository()
        this.commentRepository = new CommentRepository()
        this.notificationRepository = new NotificationRepository()
        this.s3 = new S3Service()
        this.notification = notificationService;
        this.redis = redisService;
    }
    private async sendNotification(user: HydratedDocument<IUser>) {
        try {
        const tokens = await this.redis.getFCMs(user._id)
        await this.notification.sendNotifications({tokens , data : {title : "Your post has been successfully published" , body : "✅"}})
        } catch(err) {
            console.error(err)
            throw new BadRequestException(`Fail to send Notification`, {error : err})
        }
    }
    private async cleanupPost(postId: Types.ObjectId) {
        try {
            await Promise.all([
                this.commentRepository.deleteMany({ filter : {postId} }),
                this.reactRepository.deleteMany({filter : {targetId: postId,targetType: "Post"}}),
                this.notificationRepository.deleteMany({filter : {referenceId: postId,referenceModel: "Post"}})
            ])
        } catch(err) {
            console.error(err)
            throw new BadRequestException(`Fail to delete all`, {error : err})
        }
    }
    async createPost(user : HydratedDocument<IUser> , data : createPostDTO ) : Promise<HydratedDocument<IPost>>{
        const { mentions , tags} = data
        const mentionedUsers  = await this.userRepository.find({filter : {_id : {$in : mentions as unknown as Types.ObjectId[] }}})
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new NotFoundException("Some mentioned users are invalid");
        }       
        const taggedUsers = await this.userRepository.find({filter : {_id : {$in : tags as unknown as Types.ObjectId[]}}})       
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new NotFoundException("Some tagged users are invalid");
        }
        const post = await this.postRepository.create({data : {...data , userId : user._id}})
        void this.sendNotification(user)
        return post
    }
    async updatePost(user : HydratedDocument<IUser> , data : HydratedDocument<IPost> , postId : string ) : Promise<any>{
        const { mentions , tags , content , attachments} = data   
        const post = await this.postRepository.findOne({filter : {_id : TransformToObjectId(postId) , userId : user._id}})        
        if (!post) {
            throw new NotFoundException("Can't found this post")
        }        
        if (!content && !post.content && !attachments?.image?.length && !attachments?.video?.length && !post.attachments?.image?.length && !post.attachments?.video?.length) {
            throw new BadRequestException("We can't leave empty post")
        }
        const mentionedUsers  = await this.userRepository.find({filter : {_id : {$in : mentions as Types.ObjectId[] }}})
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new NotFoundException("Some mentioned users are invalid");
        }       
        const taggedUsers = await this.userRepository.find({filter : {_id : {$in : tags as Types.ObjectId[]}}})       
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new NotFoundException("Some tagged users are invalid");
        }
        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: { _id: TransformToObjectId(postId), userId: user._id },
            update: {
                $set: {
                    content: content ?? post?.content,
                    availability: data.availability ?? post?.availability,
                    tags: (data.tags || []).map(id => TransformToObjectId(id as  unknown as string)) ?? post.tags,
                    mentions: (data.mentions || []).map(id => TransformToObjectId(id as unknown as string)) ?? post.mentions,
                    attachments: {
                    image: attachments?.image || post?.attachments?.image,
                    video: attachments?.video || post?.attachments?.video
                    }
                }
            }
        });
        if (!updatePost) {
            throw new NotFoundException("Fail to update this post")
        }
        const oldImages = post.attachments?.image || [];
        const newImages = data.attachments?.image || oldImages;
        const removedImages = (oldImages as string[]).filter((img : string) => !newImages.includes(img));
        if (removedImages.length) {
            void this.s3.deleteAssets({ Keys: removedImages.map((key : string)  => ({ Key: key }))})
        }
        const oldVideo = post.attachments?.video
        const newVideo = data.attachments?.video
        const removedVideo = (oldVideo as string[]).filter(vid => !newVideo?.includes(vid))
        if (removedVideo.length) {
            void this.s3.deleteAssets({Keys : removedVideo.map((Key : string)=>({Key}))})
        }
        return updatePost
    }
    async getPosts(user : HydratedDocument<IUser> , query : getPostsDTO):Promise<{ posts : HydratedDocument<IPost>[], nextCursor : Types.ObjectId, hasMore: boolean}>{
        const limit = Number(query.limit) || 5
        const cursor = query.cursor
        let filter : any = {
            deletedAt: { $exists: false },
            $or : getAvalibilaty(user)
        }
        if (cursor) {
            filter._id = {$lt : TransformToObjectId(cursor as string)}
        }
        const posts = await this.postRepository.aggregate([
            {
                $match : filter
            },
            {
                $sort : {_id : -1}
            },
            {
                $limit : limit
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
        ])
        const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;
        return { posts, nextCursor, hasMore: posts.length === limit}
    }
    async getPost(user : HydratedDocument<IUser> , {postId} : getPostDTO ) : Promise<IPost>{
        const [post] = await this.postRepository.aggregate([
            {
                $match : {_id : TransformToObjectId(postId)}
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
        ])
        if (!post) {
            throw new NotFoundException("This post not Exist")
        }
        return post
    }
    async deletePost(user : HydratedDocument<IUser> , {postId , force} : getPostDTO ) : Promise<string>{
        const post = await this.postRepository.findOneAndDelete({filter : {userId : user._id , _id : TransformToObjectId(postId)} , options : {force : force}})
        if (!post) {
            throw new NotFoundException("This post not Exist")
        }
        void this.cleanupPost(TransformToObjectId(postId))
        return `Post deleted successfuly`
    }

}
export const postService = new PostService()