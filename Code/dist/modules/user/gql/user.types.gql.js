"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllNotificationResponse = exports.RotateTokenResponse = exports.OneNotificationType = exports.GetByPreSignedLinkResponse = exports.CreatePreSignedLinkResponse = exports.UserMessageResponse = exports.ReactResponse = exports.AllFriendsRequestsResponse = exports.allFriendsResponse = exports.LogoutResponse = exports.UploadFileResponse = exports.SearchResponse = exports.ProfileResponse = exports.OneUserPopulateType = exports.OneUserType = exports.ViewerType = exports.FriendType = exports.notificationModelGQLEnum = exports.ReactTypeGraphQLEnum = exports.TargetTypeGraphQLEnum = exports.ProviderGraphQLEnum = exports.RoleGraphQLEnum = exports.StatusGraphQLEnum = exports.GendrGraphQLEnum = void 0;
const graphql_1 = require("graphql");
const enum_1 = require("../../../common/enum");
exports.GendrGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "GenderUserEnumGQL",
    values: {
        Male: { value: enum_1.GenderEnum.MALE },
        Female: { value: enum_1.GenderEnum.FEMALE },
    },
});
exports.StatusGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "StatusRequestUserEnumGQL",
    values: {
        Accept: { value: enum_1.StatusEnum.ACCEPT },
        Pending: { value: enum_1.StatusEnum.PENDDING },
        Cancel: { value: enum_1.StatusEnum.CANCEL },
    },
});
exports.RoleGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "RoleUserEnumGQL",
    values: {
        Admin: { value: enum_1.RoleEnum.ADMIN },
        Supervisor: { value: enum_1.RoleEnum.SUPERVISER },
        User: { value: enum_1.RoleEnum.USER },
    },
});
exports.ProviderGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "ProviderUserEnumGQL",
    values: {
        System: { value: enum_1.ProviderEnum.SYSTEM },
        Google: { value: enum_1.ProviderEnum.GOOGLE },
    },
});
exports.TargetTypeGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "TargetTypeEnumGQL",
    values: {
        Comment: { value: enum_1.ReactTargetEnum.COMMENT },
        Message: { value: enum_1.ReactTargetEnum.MESSAGE },
        Post: { value: enum_1.ReactTargetEnum.POST },
        Story: { value: enum_1.ReactTargetEnum.STORY },
        User: { value: enum_1.ReactTargetEnum.USER },
    },
});
exports.ReactTypeGraphQLEnum = new graphql_1.GraphQLEnumType({
    name: "ReactTypeEnumGQL",
    values: {
        Angry: { value: enum_1.ReactEnum.ANGRY },
        Hahh: { value: enum_1.ReactEnum.HAHHH },
        Like: { value: enum_1.ReactEnum.LIKE },
        Love: { value: enum_1.ReactEnum.LOVE },
        Sad: { value: enum_1.ReactEnum.SAD },
        Support: { value: enum_1.ReactEnum.SUPPORT },
        Wow: { value: enum_1.ReactEnum.WOW },
    },
});
exports.notificationModelGQLEnum = new graphql_1.GraphQLEnumType({
    name: "NotificationModelEnumGQL",
    values: {
        Comment: { value: enum_1.notificationModelEnum.COMMENT },
        Post: { value: enum_1.notificationModelEnum.POST },
        Story: { value: enum_1.notificationModelEnum.STORY },
        User: { value: enum_1.notificationModelEnum.USER },
        Message: { value: enum_1.notificationModelEnum.MESSAGE },
    },
});
exports.FriendType = new graphql_1.GraphQLObjectType({
    name: "FriendProfilePayload",
    description: "Simplified user payload for lists like friends and tags",
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        profileImage: { type: graphql_1.GraphQLString },
        userName: { type: graphql_1.GraphQLString },
    }),
});
exports.ViewerType = new graphql_1.GraphQLObjectType({
    name: "ProfileViewerPayload",
    description: "Holds metadata regarding a profile view action log",
    fields: () => ({
        user: { type: exports.FriendType },
        viewedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.OneUserType = new graphql_1.GraphQLObjectType({
    name: "UserCoreType",
    description: "Full secure profile payload data structure",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        userName: { type: graphql_1.GraphQLString },
        slug: { type: graphql_1.GraphQLString, description: "Auto-generated profile URL slug" },
        email: { type: graphql_1.GraphQLString },
        password: { type: graphql_1.GraphQLString, description: "Hashed credential parameter" },
        bio: { type: graphql_1.GraphQLString },
        phone: { type: graphql_1.GraphQLString },
        profileImage: { type: graphql_1.GraphQLString },
        coverImage: { type: graphql_1.GraphQLString },
        DOB: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => {
                return parent.DOB?.toISOString();
            },
        },
        friends: { type: new graphql_1.GraphQLList(exports.FriendType) },
        friendsRequest: {
            type: new graphql_1.GraphQLList(new graphql_1.GraphQLObjectType({
                name: "FriendsRequestSubField",
                fields: {
                    userId: { type: graphql_1.GraphQLID },
                    status: { type: exports.StatusGraphQLEnum },
                },
            })),
        },
        confirmedAt: { type: graphql_1.GraphQLString },
        provider: { type: exports.ProviderGraphQLEnum },
        gender: { type: exports.GendrGraphQLEnum },
        role: { type: exports.RoleGraphQLEnum },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        freezedAt: { type: graphql_1.GraphQLString },
        unfreezedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.OneUserPopulateType = new graphql_1.GraphQLObjectType({
    name: "UserPopulateType",
    description: "Medium-sized user payload for timeline interactions",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        userName: { type: graphql_1.GraphQLString },
        bio: { type: graphql_1.GraphQLString },
        phone: { type: graphql_1.GraphQLString },
        profileImage: { type: graphql_1.GraphQLString },
        coverImage: { type: graphql_1.GraphQLString },
        DOB: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => {
                return parent.DOB?.toISOString();
            },
        },
        gender: { type: exports.GendrGraphQLEnum },
    }),
});
exports.ProfileResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "ProfileResponsePayload",
    fields: () => ({
        data: { type: exports.OneUserType },
        viewersCount: { type: graphql_1.GraphQLInt },
        viewers: { type: new graphql_1.GraphQLList(exports.ViewerType) },
    }),
}));
exports.SearchResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "SearchResponsePayload",
    fields: () => ({
        data: { type: new graphql_1.GraphQLList(exports.OneUserType) },
    }),
}));
exports.UploadFileResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "UploadFileResponsePayload",
    fields: () => ({
        Key: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "S3 Object key reference identifier" }
    }),
}));
exports.LogoutResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "LogoutResponsePayload",
    description: "State status returned back post terminating user session tokens",
    fields: () => ({
        status: { type: graphql_1.GraphQLInt },
    }),
}));
exports.allFriendsResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "AllFriendsResponsePayload",
    description: "Get all friends",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        profileImage: { type: graphql_1.GraphQLString },
        userName: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(exports.FriendType) },
    }),
}));
exports.AllFriendsRequestsResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "AllFriendsRequestsResponsePayload",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        profileImage: { type: graphql_1.GraphQLString },
        userName: { type: graphql_1.GraphQLString },
        friendsRequest: {
            type: new graphql_1.GraphQLList(new graphql_1.GraphQLObjectType({
                name: "RequestsFieldsDetails",
                fields: () => ({
                    userId: { type: exports.FriendType, description: "Populated sender user metadata records" },
                    status: { type: exports.StatusGraphQLEnum }
                })
            })),
        },
    }),
}));
exports.ReactResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "ReactActionResponse",
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        userId: { type: graphql_1.GraphQLID },
        targetId: { type: graphql_1.GraphQLID },
        targetType: { type: exports.TargetTypeGraphQLEnum },
        type: { type: exports.ReactTypeGraphQLEnum },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        message: { type: graphql_1.GraphQLString },
    }),
}));
exports.UserMessageResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "UserMessageAckResponse",
    fields: () => ({
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
}));
exports.CreatePreSignedLinkResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "CreatePreSignedLinkResponsePayload",
    fields: () => ({
        url: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "AWS S3 Pre-signed destination bucket route to directly write binary file arrays" },
        Key: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
}));
exports.GetByPreSignedLinkResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "GetByPreSignedLinkResponsePayload",
    fields: () => ({
        url: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
}));
exports.OneNotificationType = new graphql_1.GraphQLObjectType({
    name: "NotificationCoreType",
    fields: () => ({
        senderId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        recipientId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        referenceId: { type: graphql_1.GraphQLID },
        title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        body: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "Notification string context description data text" },
        referenceModel: { type: exports.notificationModelGQLEnum },
        isRead: { type: graphql_1.GraphQLBoolean },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.RotateTokenResponse = new graphql_1.GraphQLObjectType({
    name: "RotateTokenResponsePayload",
    fields: () => ({
        accessToken: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        refreshToken: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
});
exports.AllNotificationResponse = new graphql_1.GraphQLObjectType({
    name: "AllNotificationResponsePayload",
    fields: () => ({
        data: { type: new graphql_1.GraphQLList(exports.OneNotificationType) }
    }),
});
