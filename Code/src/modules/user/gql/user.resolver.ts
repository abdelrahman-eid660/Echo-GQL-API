import { UserService, userService } from './../user.service';
import {  action_friend_requestGQLDTO, attachmentsValidationGQLDTO, changePasswordGQLDTO, CreatePreSignedLinkGQLDTO, GetByPreSignedLinkGQLDTO, getProfileGQLDTO, notificationValidationGQLDTO, ReactGQLDTO, searchValidationGQLDTO } from '../user.dto';
import { GraphQLValidation, isAuthenticated, isAuthorized } from '../../../middleware';
import { TokenTypeEnum } from '../../../common/enum';
import { HydratedDocument, Types } from 'mongoose';
import { INotification, IReact, IUser } from '../../../common/interface';
import { endPoint } from '../user.auth';
import { IGenerateToken, rateLimiterServer, RateLimiterServer, s3Service, S3Service } from '../../../common/service';
import { ProfileResponse } from './user.types.gql';
import { action_friend_requestGQL, attachmentsValidationGQL, changePasswordGQL, CreatePreSignedLinkGQL, GetByPreSignedLinkGQL, getProfileGQL, notificationValidationGQL, reactValidationGQL, searchValidationGQL } from '../user.validation';
import { BadRequestException } from '../../../common/exception';
export class UserResolver {
    private userService : UserService
    private readonly rateLimitServer : RateLimiterServer
    private s3 : S3Service
    constructor(){
        this.userService = userService
        this.rateLimitServer = rateLimiterServer
        this.s3 = s3Service
    }
    Profile = async(parent : unknown , args : getProfileGQLDTO , context : any ):Promise<{data : HydratedDocument<IUser> | IUser[]} | ProfileResponse>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(getProfileGQL , args) 
        const resualt = await this.userService.profile(user , args)
        return {data : resualt.user  , viewers : resualt.viewers , viewersCount : resualt.viewersCount}
    }
    createPreSignedLink = async(parent : unknown , args : CreatePreSignedLinkGQLDTO , context : any ):Promise<{url : string , Key : string}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(CreatePreSignedLinkGQL , args)
        const {OriginalName , ContentType , path } = args
        const {url , Key} = await this.s3.createPreSignedUploadLink({ContentType , OriginalName , path})
        return {url , Key}
    }
    getByPreSignedLink = async(parent : unknown , args : GetByPreSignedLinkGQLDTO , context : any ):Promise<{url : string}>=>{
        const { user } = await isAuthenticated(context)
        await GraphQLValidation(GetByPreSignedLinkGQL , args)
        const {path , download , fileName } = args
        const Key = path.join("/")
        const url = await this.s3.createPreSignedFetchLink({Key , download , fileName})        
        return {url}
    }
    react = async(parent : unknown , args : ReactGQLDTO , context : any ):Promise<{data : HydratedDocument<IReact>} | string>=>{
        const { user } = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumeUserAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        await GraphQLValidation(reactValidationGQL , args)
        const data = await this.userService.react(user , args)
        return data
    }
    allFriends = async(parent : unknown , args : any , context : any ):Promise<IUser>=>{
        const { user } = await isAuthenticated(context)
        const allFriends = await this.userService.allFriends(user)        
        return allFriends
    }
    allFriendsRequests = async(parent : unknown , args : any , context : any ):Promise<IUser>=>{
        const { user } = await isAuthenticated(context)
        const allFriendsRequests = await this.userService.allFriendsRequests(user)                
        return allFriendsRequests
    }
    addFriend = async(parent : unknown , {userId} : {userId : string} , context : any ):Promise<{message : string}>=>{
        const {user} = await isAuthenticated(context)
        try {
            await this.rateLimitServer.consumeUserAction(user._id)
        } catch (rateLimitReject : any) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000)
            throw new BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`)
        }      
        const message = await this.userService.addFriend(user, {userId})
        return { message}
    }
    search = async(parent : unknown , args : searchValidationGQLDTO , context : any ):Promise<{data : IUser[]}>=>{
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(searchValidationGQL , args)
        const users = await this.userService.search(user, args)
        return {data : users}
    }
    actionOfRequestFriend = async(parent : unknown , args : action_friend_requestGQLDTO , context : any ):Promise<{message : string}>=>{
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(action_friend_requestGQL , args)
        const message = await this.userService.actionOfRequestFriend(user , args)
        return { message}
    }
    allNotifications = async(parent : unknown , args : any , context : any ):Promise<{data : HydratedDocument<INotification>[]}>=>{  
        const {user} = await isAuthenticated(context)        
        const data = await this.userService.getAllNofitications(user)    
        return {data}
    }
    readNotification = async(parent : unknown , args : notificationValidationGQLDTO , context : any ):Promise<{message : string}>=>{  
        const {user} = await isAuthenticated(context)       
        await GraphQLValidation(notificationValidationGQL , args) 
        const message = await this.userService.readNotifications(user , args)    
        return message
    }
    profileImage = async(parent : unknown , args : attachmentsValidationGQLDTO , context : any ):Promise<{data : HydratedDocument<IUser>}>=>{        
        const {user} = await isAuthenticated(context)  
        await GraphQLValidation(attachmentsValidationGQL , args)      
        const data = await this.userService.profileImage(user , args)
        return {data}
    }
    coverImage = async(parent : unknown ,  args : attachmentsValidationGQLDTO , context : any ):Promise<{data : HydratedDocument<IUser>}>=>{        
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(attachmentsValidationGQL , args)      
        const data = await this.userService.coverImage(user , args)
        return {data}
    }
    updatePassword = async(parent : unknown , args: changePasswordGQLDTO, context : any ):Promise<{message : string}>=>{        
        const {user} = await isAuthenticated(context)
        await GraphQLValidation(changePasswordGQL , args)      
        const message = await this.userService.updatePassword( args , user)
        return {message}
    }
    logout = async(parent : unknown ,   args : {flag : number} , context : any ):Promise<{status : number}>=>{                
        const {user , decode} = await isAuthenticated(context)
        const status = await this.userService.logout(args , user  ,decode)
        return {status}
    }
    freezeUser = async(parent : unknown ,  { userId }: { userId: string } , context : any ):Promise<{message : string}>=>{        
        const {user} = await isAuthenticated(context)
        await isAuthorized(endPoint.SensiveAuth , user)
        const message = await this.userService.freezeUser({userId})
        return {message}
    }
    unFreezeUser = async(parent : unknown ,  { userId }: { userId: string } , context : any ):Promise<{message : string}>=>{        
        const {user} = await isAuthenticated(context)
        await isAuthorized(endPoint.SensiveAuth , user)
        const message = await this.userService.unFreezeUser({userId})
        return {message}
    }
    softDelete = async(parent : unknown ,  { userId }: { userId: string } , context : any ):Promise<{message : string}>=>{        
        const {user} = await isAuthenticated(context)
        await isAuthorized(endPoint.SensiveAuth , user)
        const message = await this.userService.softDelete({userId})
        return {message}
    }
    restoreUser = async(parent : unknown ,  { userId }: { userId: string } , context : any ):Promise<{message : string}>=>{        
        const {user} = await isAuthenticated(context)
        await isAuthorized(endPoint.SensiveAuth , user)
        const message = await this.userService.restoreUser({userId})
        return {message}
    }
    hardDelete = async(parent : unknown , args : any , context : any ):Promise<{message : string}>=>{
        const { user } = await isAuthenticated(context)
        const message = await this.userService.hardDelete(user)
        return {message}
    }
    rotateToken = async(parent : unknown , args : any , context : any ):Promise<IGenerateToken>=>{  
        const {user , decode} = await isAuthenticated(context , TokenTypeEnum.REFREASH)
        const {accessToken , refreshToken} = await this.userService.rotateToken(user , context.ip ,decode)
        return {accessToken , refreshToken}
    }
}
export const userResolver = new UserResolver()