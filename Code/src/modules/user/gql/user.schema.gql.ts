import * as userTypes from './user.types.gql'
import * as userArgs from './user.args.gql'
import { UserResolver, userResolver } from "./user.resolver"
export class UserSchema {
    private userResolver : UserResolver
    constructor(){
        this.userResolver = userResolver
    }
    registerQuery(){
        return {
            Profile : {
                type : userTypes.ProfileResponse,
                args : userArgs.profileArgs,
                resolve : this.userResolver.Profile
            },
            allFriends : {
                type : userTypes.allFriendsResponse,
                resolve : this.userResolver.allFriends
            },
            allFriendsRequests : {
                type : userTypes.AllFriendsRequestsResponse,
                resolve : this.userResolver.allFriendsRequests
            },
            allNofitications : {
                type : userTypes.AllNotificationResponse,
                resolve : this.userResolver.allNotifications
            },
            getByPreSignedLink : {
                type : userTypes.GetByPreSignedLinkResponse,
                args : userArgs.getByPreSignedLinkArgs,
                resolve : this.userResolver.getByPreSignedLink
            },
            rotateToken : {
                type : userTypes.RotateTokenResponse,
                resolve : this.userResolver.rotateToken
            },
            search : {
                type : userTypes.SearchResponse,
                args : userArgs.searchArgs,
                resolve : this.userResolver.search
            },
        }
    }
    registerMutation(){
        return {
            addFriend : {
                type : userTypes.UserMessageResponse,
                args : userArgs.userIdArgs,
                resolve : this.userResolver.addFriend
            },
            createPreSignedLink : {
                type : userTypes.CreatePreSignedLinkResponse,
                args : userArgs.createPreSignedLinkArgs,
                resolve : this.userResolver.createPreSignedLink
            },
            react : {
                type : userTypes.ReactResponse,
                args : userArgs.reactArgsGQL,
                resolve : this.userResolver.react
            },
            actionOfRequestFriend : {
                type : userTypes.UserMessageResponse,
                args : userArgs.actionOfRequestFriendArgs,
                resolve : this.userResolver.actionOfRequestFriend
            },
            profileImage : {
                type : userTypes.ProfileResponse,
                args : userArgs.s3KeyArgs,
                resolve : this.userResolver.profileImage
            },
            coverImage : {
                type : userTypes.ProfileResponse,
                args : userArgs.s3KeyArgs,
                resolve : this.userResolver.coverImage
            },
            readNotification : {
                type : userTypes.UserMessageResponse,
                args : userArgs.notificationIdArgs,
                resolve : this.userResolver.readNotification
            },
            updatePassword : {
                type : userTypes.UserMessageResponse,
                args : userArgs.updatePasswordArgs,
                resolve : this.userResolver.updatePassword
            },
            logout : {
                type : userTypes.LogoutResponse,
                args : userArgs.logoutArgs,
                resolve : this.userResolver.logout
            },
            freezeUser : {
                type : userTypes.UserMessageResponse,
                args : userArgs.userIdArgs,
                resolve : this.userResolver.freezeUser
            },
            unFreezeUser : {
                type : userTypes.UserMessageResponse,
                args : userArgs.userIdArgs,
                resolve : this.userResolver.unFreezeUser
            },
            softDelete : {
                type : userTypes.UserMessageResponse,
                args : userArgs.userIdArgs,
                resolve : this.userResolver.softDelete
            },
            restoreUser : {
                type : userTypes.UserMessageResponse,
                args : userArgs.userIdArgs,
                resolve : this.userResolver.restoreUser
            },
            hardDelete : {
                type : userTypes.UserMessageResponse,
                resolve : this.userResolver.hardDelete
            },
        }
    }
}
export const userSchema = new UserSchema()