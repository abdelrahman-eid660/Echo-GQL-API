import {  HydratedDocument } from 'mongoose';
import { NotificationService, notificationService, redisService, RedisService, s3Service, S3Service } from '../../common/service';
import { CommentRepository, NotificationRepository, ReactRepository, UserRepository ,PostRepository } from '../../DB/Repository';
import {  BadRequestException, NotFoundException } from '../../common/exception';
import { IUser , IComment } from '../../common/interface';
import {  createCommentGQLDTO, getAllCommentsGQLDTO, getCommentGQLDTO, replyCommentGQLDTO } from './comment.dto';
import { TransformToObjectId } from '../../common/utils/ObjectId';
import { notificationModelEnum } from '../../common/enum';
import { getAvalibilaty } from '../../common/utils/post';
export class CommentService {
    private readonly postRepository : PostRepository
    private readonly userRepository : UserRepository
    private readonly reactRepository : ReactRepository
    private readonly commentRepository : CommentRepository
    private readonly NotificationRepository : NotificationRepository
    private readonly redis: RedisService;
    private readonly s3: S3Service;
    private readonly notification: NotificationService;
    constructor(){
        this.userRepository = new UserRepository()
        this.postRepository = new PostRepository()
        this.NotificationRepository = new NotificationRepository()
        this.commentRepository = new CommentRepository()
        this.reactRepository = new ReactRepository()
        this.redis = redisService;
        this.s3 = s3Service;
        this.notification = notificationService;
    }
    private async cleanAssets(attachments : string[]){
        try {
        if (attachments.length) {
            await this.s3.deleteAssets({Keys : attachments.map((Key : string)=>({Key}))})
        }
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Fail to delete all attachments of comment")
        }
    }
    async createComment(user : HydratedDocument<IUser> , data : createCommentGQLDTO):Promise<IComment>{
        const postId = TransformToObjectId(data.postId as string)
        const PostExist = await this.postRepository.findOne({
            filter : {
                deletedAt: { $exists: false },
                _id : postId,
                $or : getAvalibilaty(user)
                }
            }
        )
        if (!PostExist) {
            throw new NotFoundException("This Post Not Exist")
        }
        const comment = await this.commentRepository.create({data : {  ...data , userId : user._id , postId}})
        const tokens = await this.redis.getFCMs(user._id)
        await this.notification.sendNotifications({tokens , data : {title : `${user.userName} commented on your post` , body : `${comment.content?.slice(0,20)}`}})
        await this.NotificationRepository.create({data : {recipientId : PostExist.userId , senderId : user._id , title : `${user.userName} commented on your post` , referenceId : comment._id , referenceModel : notificationModelEnum.COMMENT , body : JSON.stringify({content : comment.content , attachments : comment.attachments || {}})}})
        return comment
    }
    async replyComment(user : HydratedDocument<IUser> , data : replyCommentGQLDTO):Promise<IComment>{
        const commentId = TransformToObjectId(data.commentId)
        const postId = TransformToObjectId(data.postId)
        const PostExist = await this.postRepository.findOne({
            filter : {
                deletedAt: { $exists: false },
                _id : postId,
                $or : getAvalibilaty(user)
                }
            }
        )
        if (!PostExist) {
            throw new NotFoundException("This Post Not Exist")
        }
        const commentExist = await this.commentRepository.findById({_id : commentId})
        if (!commentExist) {
            throw new NotFoundException("This comment not exist")
        }
        const newComment = await this.commentRepository.create({data : { ...data  , postId , parentComment : commentId , userId : user._id }})
        return newComment 
    }
    async getAllComments(user : HydratedDocument<IUser> , query : getAllCommentsGQLDTO):Promise<IComment[]>{
        const postId = TransformToObjectId(query.postId as string)
        const limit = Number(query?.limit) || 5
        const cursor = query?.cursor        
        const filter : any = { postId : postId , deletedAt : {$exists : false}}
        if (cursor) {
            filter._id = {$le : TransformToObjectId(cursor as string)}
        }
        const allCommentsRelatedByPost = await this.commentRepository.aggregate([
            {
                $match : filter
            },
            {
                $limit : limit
            },
            {
                $lookup : {
                    from : "posts",
                    let : {postId : "$postId"},
                    pipeline : [
                        {
                            $match : {
                                $expr : {
                                    $and : [
                                        {$eq : ["$_id" , "$$postId"]},
                                        {$eq : ["$userId" , user._id]}
                                    ]
                                }
                            }
                        }
                    ],
                    as : "post"
                }
            },
            {
                $match : {post : {$ne : []}}
            },
            {
                $lookup : {
                    from : "users",
                    localField : "userId",
                    foreignField : "_id",
                    as : "user"
                }
            },
            {
                $project : {
                    "user.email" : 0,
                    "user.password" : 0,
                    "user.provider" : 0,
                    "user.role" : 0,
                    "user.DOB" : 0,
                    "user.gender" : 0,
                    "user.updatedAt" : 0,
                    "user.__v" : 0,
                    "user.confirmedAt" : 0,
                    "user.friends" : 0,
                    "user.friendsRequest" : 0,
                }
            },
            {
                $unwind : "$user"
            },
            {
                $sort : {createdAt : -1}
            }
        ])        
        return allCommentsRelatedByPost
    }
    async getComment(user : HydratedDocument<IUser> ,  {commentId , postId} : getCommentGQLDTO):Promise<IComment>{
        const PostId = TransformToObjectId(postId as string)
        const CommentId =  TransformToObjectId(commentId)
        const PostExist = await this.postRepository.findById({_id : PostId})
        if (!PostExist) {
            throw new NotFoundException("This Post Not Exist")
        }
        const comment = await this.commentRepository.findOne({filter : {_id : CommentId , postId : PostId }})
        if (!comment) {
            throw new NotFoundException("This comment not exist")
        }
        return comment as unknown as IComment
    }
    async updateComment(user : HydratedDocument<IUser> , data : createCommentGQLDTO):Promise<IComment>{
        const commentId =  TransformToObjectId(data.commentId)
        const postId = TransformToObjectId(data.postId as string)
        const PostExist = await this.postRepository.findOne({
            filter : {
                deletedAt: { $exists: false },
                _id : postId,
                $or : getAvalibilaty(user)
                }
            }
        )
        if (!PostExist) {
            throw new NotFoundException("This Post Not Exist")
        }
        const comment = await this.commentRepository.findOne({filter : {_id : commentId , postId , userId : user._id }})
        if (!comment) {
            throw new NotFoundException("This comment not exist")
        }
        let removedImages : string[] = [];
        let removedVideos : string[] = [];
        if (data.attachments?.image.length) {
            const oldImage = comment.attachments?.image || []
            const newImage = data.attachments.image || oldImage
            removedImages = oldImage?.filter((img : string)=>{{!newImage.includes(img)}})
        }
        if (data.attachments?.video.length) {
            const oldvideo = comment.attachments?.video || []
            const newvideo = comment.attachments?.video || oldvideo
            removedVideos = oldvideo.filter((vid : string)=>{!newvideo.includes(vid)})
        }
        const removedAssets = [...removedImages , ...removedVideos]
        if (removedAssets.length > 0) {
            void this.cleanAssets(removedAssets)
        }
        const updatedComment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId,postId,userId: user._id},
            update: {
                $set: {
                    content: data.content ?? comment.content,
                    mentions: data.mentions ?? comment.mentions,
                    attachments: {image: data.attachments?.image ?? comment.attachments?.image ,video: data.attachments?.video ?? comment.attachments?.video}
                }
            }
        })
        if (!updatedComment) {
            throw new BadRequestException("Fail to update comment")
        }
        return updatedComment
    }
    async deleteComment(user: HydratedDocument<IUser>, data: getCommentGQLDTO): Promise<string> {
    const commentId = TransformToObjectId(data.commentId)
    const postId = TransformToObjectId(data.postId as string)
    const postExist = await this.postRepository.findOne({filter: {deletedAt: { $exists: false },_id: postId,$or: getAvalibilaty(user)}})
    if (!postExist) {
        throw new NotFoundException("This Post Not Exist")
    }
    const comment = await this.commentRepository.findOne({filter: {_id: commentId,postId,$or: [{ userId: user._id }, { userId: postExist.userId }]}
    })
    if (!comment) {
        throw new NotFoundException("This comment Not exist")
    }
    const attachments = [
        ...(comment.attachments?.image || []),
        ...(comment.attachments?.video || [])
    ]
    await Promise.all([
        this.cleanAssets(attachments),
        this.NotificationRepository.deleteMany({filter : {referenceId : comment._id , referenceModel : "Comment"} }),
        this.reactRepository.deleteMany({filter : {targetId : comment._id , targetType : "Comment"} }),
        this.commentRepository.deleteOne({ filter: { _id: comment._id } })
    ])
    return "Deleted successfully"
    }
}
export const commentService = new CommentService()