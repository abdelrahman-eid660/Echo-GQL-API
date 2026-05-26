import { HydratedDocument, Types } from 'mongoose';
import { NotificationService, notificationService, redisService, RedisService, s3Service, S3Service } from '../../common/service';
import { StoryRepository, UserRepository , ReactRepository, NotificationRepository } from '../../DB/Repository';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../../common/exception';
import { IUser, IStory, IReact} from '../../common/interface';
import { TransformToObjectId } from '../../common/utils/ObjectId';
import { getAvalibilaty } from '../../common/utils/post';
import { notificationModelEnum, ReactEnum } from '../../common/enum';
import { deleteStoryDTO, getStoriesDTO, watchStoryDTO, getUserStoriesDTO, getViewerAndReactsStoriesDTO, updateStoryDTO } from './story.dto';
type StoryWithViews = IStory & {
  viewsCount?: number
  isOwner? : boolean
  isViewed? : boolean
  currentUserReact? : ReactEnum | null
}
export class StoryService {
    private readonly userRepository : UserRepository
    private readonly storyRepository : StoryRepository
    private readonly reactRepository : ReactRepository
    private readonly notification: NotificationService;
    private readonly NotificationRepository: NotificationRepository;
    private readonly redis: RedisService;
    private readonly s3 : S3Service;
    constructor(){
        this.userRepository = new UserRepository()
        this.storyRepository = new StoryRepository()
        this.reactRepository = new ReactRepository()
        this.NotificationRepository = new NotificationRepository()
        this.notification = notificationService;
        this.redis = redisService;
        this.s3 = s3Service;
    }
    private async cleanupStoryData(Keys : {Key : string}[] , story : IStory){
        try {
            await this.s3.deleteAssets({Keys})
            await this.NotificationRepository.deleteOne({filter : {referenceId : story._id , referenceModel : notificationModelEnum.STORY}})
            await this.redis.removeStoryUser(story._id)
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Fail to delete all story attachments from S3 or notification or story cash redis")
        }
    }
    // Create Story
    async createStory(user : HydratedDocument<IUser> , data : HydratedDocument<IStory> ) : Promise<IStory>{
        const { mentions , tags} = data
        const mentionedUsers  = await this.userRepository.find({filter : {_id : {$in : mentions as Types.ObjectId[] }}})
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new NotFoundException("Some mentioned users are invalid");
        }       
        const taggedUsers = await this.userRepository.find({filter : {_id : {$in : tags as Types.ObjectId[]}}})       
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new NotFoundException("Some tagged users are invalid");
        }
        const story = await this.storyRepository.create({data : {...data , userId : user._id}})
        const tokens = await this.redis.getFCMs(user._id)
        if (tokens) {
            void this.notification.sendNotifications({tokens , data : {title : "Your story has been successfully published" , body : "✅"}})
        }
        if (user.friends?.length) {
            const friendsTokens = await this.redis.getFCMsMulti(user.friends)
            if (friendsTokens.length) {
                void this.notification.sendNotifications({tokens : friendsTokens as unknown as string[], data : {title : `${user.userName} published a new story` , body : "✅"}})
                void this.NotificationRepository.create({data: user.friends.map((friendId) => ({senderId: user.id,recipientId: friendId,title: `${user.userName} publish a new story`,body: "✅",referenceModel: notificationModelEnum.STORY,referenceId: story._id}))});
            }
        }
        return story
    }
    //update Story
    async updateStory(user : HydratedDocument<IUser> , data : updateStoryDTO ) : Promise<IStory>{
        const { mentions} = data
        const story = await this.storyRepository.findOne({filter : {_id : TransformToObjectId(data.storyId) , userId : user._id}})
        if (!story) {
            throw new NotFoundException("Can't found this story")
        }
        const mentionedUsers  = await this.userRepository.find({filter : {_id : {$in : data.mentions as unknown as Types.ObjectId[] }}})
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new NotFoundException("Some mentioned users are invalid");
        }       
        const updatestory = await this.storyRepository.findOneAndUpdate({
            filter: { _id: TransformToObjectId(data.storyId), userId: user._id },
            update: {
                $set: {
                    availability: data.availability ?? story?.availability,
                    mentions: data.mentions !== undefined ?  (data.mentions).map(id => TransformToObjectId(id as unknown as string)) : story.mentions,
                }
            }
        });
        if (!updatestory) {
            throw new NotFoundException("Fail to update this story")
        }
        return updatestory
    }
    // get ALL Story for home page
    async getStories(user : HydratedDocument<IUser> , query : getStoriesDTO):Promise<{stories : IStory[] , nextCursor : Types.ObjectId | null | undefined , hasMore : boolean}>{
        let filter : any = {
         $or : getAvalibilaty(user) , expiresAt: { $gt: new Date() }  
        }
        if (query.cursor) {
            filter._id = {$le : TransformToObjectId(query.cursor)}
        }
        const stories = await this.storyRepository.find({filter, options : {limit : query.limit ?? 5 ,sort : {createdAt : -1} , populate : [{path : "userId" , select : "firstName lastName profileImage"}]}})
        if (!stories.length) {
            throw new NotFoundException("There no't any stories")
        }
        const nextCursor = stories.length > 0 ? stories[stories?.length - 1]?._id : null;
        return {stories , nextCursor , hasMore : stories.length === query.limit}
    }
    // get Friends & me Stories
    async getUserStories(user : HydratedDocument<IUser> , query : getUserStoriesDTO):Promise<StoryWithViews[]>{        
        let filter : any = {
         $or : getAvalibilaty(user) , expiresAt: { $gt: new Date() } , userId : query.userId
        }
        const stories = await this.storyRepository.find({filter, options : {populate : [{path : "userId" , select : "firstName lastName profileImage"}]}})
        if (!stories.length) {
            throw new NotFoundException("There no't any stories")
        }
        const isOwner = user._id.toString() === query.userId;
        const storyIds = stories.map(s => s._id.toString());
        const [viewedMap, reacts , viewsMap] = await Promise.all([
            !isOwner ? this.redis.isViewedMulti(stories, user._id) : null,
            !isOwner ? this.reactRepository.find({ filter: { targetId: { $in: storyIds }, userId: user._id } }) : [] ,
            isOwner ? this.redis.viewersCountMulti(stories) : null,
        ]); 
        const userReactsMap = new Map(reacts.map(r => [r.targetId.toString(), r.type]));
        return stories.map(story => {
            const idStr = story._id.toString();
            return {
                ...story.toObject(),
                isOwner,
                isViewed: viewedMap ? (viewedMap.get(idStr) || false) : true,
                viewsCount : viewsMap?.get(idStr) || 0,
                currentUserReact: userReactsMap ?  (userReactsMap.get(idStr) || null) : null
            };
        });
    }
    // getViewerAndReactsStories for owner
    async getViewerAndReactsStories(user : HydratedDocument<IUser> , query : getViewerAndReactsStoriesDTO):Promise<{viewer:  IUser  | undefined , reacts : IReact | undefined , viewedAt: string}[]>{
        const {storyId , userId} = query
        const story = await this.storyRepository.findOne({filter : {_id : storyId , userId }})
        if (!story) {
            throw new NotFoundException("This story not exists")
        }
        if (user._id.toString() !== story?.userId.toString()) {
            throw new UnauthorizedException("you can't access to theses data ")
        }
        const viewers = await this.redis.getViewersWithDate(storyId)
        const reacts = await this.reactRepository.find({filter: { targetId: storyId },options: {populate: [{path: "userId",select: "firstName lastName profileImage"}]}})
        const users = await this.userRepository.find({filter: { _id: {$in : viewers.map(u=>u.value)} },projection : "firstName lastName profileImage"})
        const reactsMap = new Map(reacts.map(react=>[react.userId._id.toString() , react]))
        const usersMap = new Map(users.map(user=>[user._id.toString() , user]))
        const groupedviewer = viewers.map(v=>({
            viewer : usersMap.get(v.value),
            reacts : reactsMap.get(v.value),
            viewedAt : new Date(v.score).toISOString(),
        }))
        return groupedviewer
    }
    // watch story and add view
    async watchStory(user : HydratedDocument<IUser> , {storyId} : watchStoryDTO  ) : Promise<string>{
        const story = await this.storyRepository.findOne({filter : { _id : TransformToObjectId(storyId), $or : getAvalibilaty(user) , expiresAt: { $gt: new Date() }} , options : {populate : [{path : "userId" , select : "firstName lastName profileImage"}]}})
        if (!story) {
            throw new NotFoundException("This story not Exist")
        }
        if (user._id.toString() !== story?.userId?._id.toString()) {
            const isViewed =  await this.redis.isViewed(story._id , user?._id)
            const storyId = this.redis.View_Key({viewId : story._id})
            if (!isViewed) {
                await this.redis.addViewer(storyId , user?._id.toString() , Date.now())
            }
            return `Add view success`
        }
        return 'You the owner'
    }
    // delete story
    async deleteStory(user : HydratedDocument<IUser> , {storyId} : deleteStoryDTO ) : Promise<string>{
        const story = await this.storyRepository.findOneAndDelete({filter : {userId : user._id , _id : TransformToObjectId(storyId)}})
        if (!story) {
            throw new NotFoundException("This story not Exist")
        }
        const Keys : {Key : string}[] = [
         ...(story.attachments?.image || [])?.map(Key =>({Key})) ,
         ...(story.attachments?.video || [])?.map(Key=>({Key})) 
        ]
        void this.cleanupStoryData(Keys , story)
        return `Story deleted successfuly`
    }

}
export const storyService = new StoryService()