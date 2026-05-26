"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = require("./../user.service");
const middleware_1 = require("../../../middleware");
const enum_1 = require("../../../common/enum");
const user_auth_1 = require("../user.auth");
const service_1 = require("../../../common/service");
const user_validation_1 = require("../user.validation");
const exception_1 = require("../../../common/exception");
class UserResolver {
    userService;
    rateLimitServer;
    s3;
    constructor() {
        this.userService = user_service_1.userService;
        this.rateLimitServer = service_1.rateLimiterServer;
        this.s3 = service_1.s3Service;
    }
    Profile = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.getProfileGQL, args);
        const resualt = await this.userService.profile(user, args);
        return { data: resualt.user, viewers: resualt.viewers, viewersCount: resualt.viewersCount };
    };
    createPreSignedLink = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.CreatePreSignedLinkGQL, args);
        const { OriginalName, ContentType, path } = args;
        const { url, Key } = await this.s3.createPreSignedUploadLink({ ContentType, OriginalName, path });
        return { url, Key };
    };
    getByPreSignedLink = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.GetByPreSignedLinkGQL, args);
        const { path, download, fileName } = args;
        const Key = path.join("/");
        const url = await this.s3.createPreSignedFetchLink({ Key, download, fileName });
        return { url };
    };
    react = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeUserAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        await (0, middleware_1.GraphQLValidation)(user_validation_1.reactValidationGQL, args);
        const data = await this.userService.react(user, args);
        return data;
    };
    allFriends = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const allFriends = await this.userService.allFriends(user);
        return allFriends;
    };
    allFriendsRequests = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const allFriendsRequests = await this.userService.allFriendsRequests(user);
        return allFriendsRequests;
    };
    addFriend = async (parent, { userId }, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        try {
            await this.rateLimitServer.consumeUserAction(user._id);
        }
        catch (rateLimitReject) {
            const secondsLeft = Math.ceil(rateLimitReject.msBeforeNext / 1000);
            throw new exception_1.BadRequestException(`Too many post actions! Please wait ${secondsLeft} seconds.`);
        }
        const message = await this.userService.addFriend(user, { userId });
        return { message };
    };
    search = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.searchValidationGQL, args);
        const users = await this.userService.search(user, args);
        return { data: users };
    };
    actionOfRequestFriend = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.action_friend_requestGQL, args);
        const message = await this.userService.actionOfRequestFriend(user, args);
        return { message };
    };
    allNotifications = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const data = await this.userService.getAllNofitications(user);
        return { data };
    };
    readNotification = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.notificationValidationGQL, args);
        const message = await this.userService.readNotifications(user, args);
        return message;
    };
    profileImage = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.attachmentsValidationGQL, args);
        const data = await this.userService.profileImage(user, args);
        return { data };
    };
    coverImage = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.attachmentsValidationGQL, args);
        const data = await this.userService.coverImage(user, args);
        return { data };
    };
    updatePassword = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.GraphQLValidation)(user_validation_1.changePasswordGQL, args);
        const message = await this.userService.updatePassword(args, user);
        return { message };
    };
    logout = async (parent, args, context) => {
        const { user, decode } = await (0, middleware_1.isAuthenticated)(context);
        const status = await this.userService.logout(args, user, decode);
        return { status };
    };
    freezeUser = async (parent, { userId }, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.isAuthorized)(user_auth_1.endPoint.SensiveAuth, user);
        const message = await this.userService.freezeUser({ userId });
        return { message };
    };
    unFreezeUser = async (parent, { userId }, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.isAuthorized)(user_auth_1.endPoint.SensiveAuth, user);
        const message = await this.userService.unFreezeUser({ userId });
        return { message };
    };
    softDelete = async (parent, { userId }, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.isAuthorized)(user_auth_1.endPoint.SensiveAuth, user);
        const message = await this.userService.softDelete({ userId });
        return { message };
    };
    restoreUser = async (parent, { userId }, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        await (0, middleware_1.isAuthorized)(user_auth_1.endPoint.SensiveAuth, user);
        const message = await this.userService.restoreUser({ userId });
        return { message };
    };
    hardDelete = async (parent, args, context) => {
        const { user } = await (0, middleware_1.isAuthenticated)(context);
        const message = await this.userService.hardDelete(user);
        return { message };
    };
    rotateToken = async (parent, args, context) => {
        const { user, decode } = await (0, middleware_1.isAuthenticated)(context, enum_1.TokenTypeEnum.REFREASH);
        const { accessToken, refreshToken } = await this.userService.rotateToken(user, context.ip, decode);
        return { accessToken, refreshToken };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
