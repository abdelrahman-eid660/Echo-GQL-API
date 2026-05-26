"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.UserSchema = void 0;
const userTypes = __importStar(require("./user.types.gql"));
const userArgs = __importStar(require("./user.args.gql"));
const user_resolver_1 = require("./user.resolver");
class UserSchema {
    userResolver;
    constructor() {
        this.userResolver = user_resolver_1.userResolver;
    }
    registerQuery() {
        return {
            Profile: {
                type: userTypes.ProfileResponse,
                args: userArgs.profileArgs,
                resolve: this.userResolver.Profile
            },
            allFriends: {
                type: userTypes.allFriendsResponse,
                resolve: this.userResolver.allFriends
            },
            allFriendsRequests: {
                type: userTypes.AllFriendsRequestsResponse,
                resolve: this.userResolver.allFriendsRequests
            },
            allNofitications: {
                type: userTypes.AllNotificationResponse,
                resolve: this.userResolver.allNotifications
            },
            getByPreSignedLink: {
                type: userTypes.GetByPreSignedLinkResponse,
                args: userArgs.getByPreSignedLinkArgs,
                resolve: this.userResolver.getByPreSignedLink
            },
            rotateToken: {
                type: userTypes.RotateTokenResponse,
                resolve: this.userResolver.rotateToken
            },
            search: {
                type: userTypes.SearchResponse,
                args: userArgs.searchArgs,
                resolve: this.userResolver.search
            },
        };
    }
    registerMutation() {
        return {
            addFriend: {
                type: userTypes.UserMessageResponse,
                args: userArgs.userIdArgs,
                resolve: this.userResolver.addFriend
            },
            createPreSignedLink: {
                type: userTypes.CreatePreSignedLinkResponse,
                args: userArgs.createPreSignedLinkArgs,
                resolve: this.userResolver.createPreSignedLink
            },
            react: {
                type: userTypes.ReactResponse,
                args: userArgs.reactArgsGQL,
                resolve: this.userResolver.react
            },
            actionOfRequestFriend: {
                type: userTypes.UserMessageResponse,
                args: userArgs.actionOfRequestFriendArgs,
                resolve: this.userResolver.actionOfRequestFriend
            },
            profileImage: {
                type: userTypes.ProfileResponse,
                args: userArgs.s3KeyArgs,
                resolve: this.userResolver.profileImage
            },
            coverImage: {
                type: userTypes.ProfileResponse,
                args: userArgs.s3KeyArgs,
                resolve: this.userResolver.coverImage
            },
            readNotification: {
                type: userTypes.UserMessageResponse,
                args: userArgs.notificationIdArgs,
                resolve: this.userResolver.readNotification
            },
            updatePassword: {
                type: userTypes.UserMessageResponse,
                args: userArgs.updatePasswordArgs,
                resolve: this.userResolver.updatePassword
            },
            logout: {
                type: userTypes.LogoutResponse,
                args: userArgs.logoutArgs,
                resolve: this.userResolver.logout
            },
            freezeUser: {
                type: userTypes.UserMessageResponse,
                args: userArgs.userIdArgs,
                resolve: this.userResolver.freezeUser
            },
            unFreezeUser: {
                type: userTypes.UserMessageResponse,
                args: userArgs.userIdArgs,
                resolve: this.userResolver.unFreezeUser
            },
            softDelete: {
                type: userTypes.UserMessageResponse,
                args: userArgs.userIdArgs,
                resolve: this.userResolver.softDelete
            },
            restoreUser: {
                type: userTypes.UserMessageResponse,
                args: userArgs.userIdArgs,
                resolve: this.userResolver.restoreUser
            },
            hardDelete: {
                type: userTypes.UserMessageResponse,
                resolve: this.userResolver.hardDelete
            },
        };
    }
}
exports.UserSchema = UserSchema;
exports.userSchema = new UserSchema();
