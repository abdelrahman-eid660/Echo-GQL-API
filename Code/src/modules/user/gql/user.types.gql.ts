import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  GenderEnum,
  notificationModelEnum,
  ProviderEnum,
  ReactEnum,
  ReactTargetEnum,
  RoleEnum,
  StatusEnum,
} from "../../../common/enum";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../../common/interface";
export type ProfileResponse = {
  data: HydratedDocument<IUser>
  viewers?: any[]
  viewersCount?: number
}
export const GendrGraphQLEnum = new GraphQLEnumType({
  name: "GenderUserEnumGQL",
  values: {
    Male: { value: GenderEnum.MALE },
    Female: { value: GenderEnum.FEMALE },
  },
});
export const StatusGraphQLEnum = new GraphQLEnumType({
  name: "StatusRequestUserEnumGQL",
  values: {
    Accept: { value: StatusEnum.ACCEPT },
    Pending: { value: StatusEnum.PENDDING },
    Cancel: { value: StatusEnum.CANCEL },
  },
});
export const RoleGraphQLEnum = new GraphQLEnumType({
  name: "RoleUserEnumGQL",
  values: {
    Admin: { value: RoleEnum.ADMIN },
    Supervisor: { value: RoleEnum.SUPERVISER },
    User: { value: RoleEnum.USER },
  },
});
export const ProviderGraphQLEnum = new GraphQLEnumType({
  name: "ProviderUserEnumGQL",
  values: {
    System: { value: ProviderEnum.SYSTEM },
    Google: { value: ProviderEnum.GOOGLE },
  },
});
export const TargetTypeGraphQLEnum = new GraphQLEnumType({
  name: "TargetTypeEnumGQL",
  values: {
    Comment: { value: ReactTargetEnum.COMMENT },
    Message: { value: ReactTargetEnum.MESSAGE },
    Post: { value: ReactTargetEnum.POST },
    Story: { value: ReactTargetEnum.STORY },
    User: { value: ReactTargetEnum.USER },
  },
});
export const ReactTypeGraphQLEnum = new GraphQLEnumType({
  name: "ReactTypeEnumGQL",
  values: {
    Angry: { value: ReactEnum.ANGRY },
    Hahh: { value: ReactEnum.HAHHH },
    Like: { value: ReactEnum.LIKE },
    Love: { value: ReactEnum.LOVE },
    Sad: { value: ReactEnum.SAD },
    Support: { value: ReactEnum.SUPPORT },
    Wow: { value: ReactEnum.WOW },
  },
});
export const notificationModelGQLEnum = new GraphQLEnumType({
  name: "NotificationModelEnumGQL",
  values: {
    Comment: { value: notificationModelEnum.COMMENT },
    Post: { value: notificationModelEnum.POST },
    Story: { value: notificationModelEnum.STORY },
    User: { value: notificationModelEnum.USER },
    Message: { value: notificationModelEnum.MESSAGE },
  },
});
export const FriendType = new GraphQLObjectType({
  name: "FriendProfilePayload",
  description: "Simplified user payload for lists like friends and tags",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    userName: { type: GraphQLString },
  }),
});
export const ViewerType = new GraphQLObjectType({
  name: "ProfileViewerPayload",
  description: "Holds metadata regarding a profile view action log",
  fields: () => ({
    user: { type: FriendType },
    viewedAt: { type: GraphQLString },
  }),
});
export const OneUserType: GraphQLObjectType = new GraphQLObjectType({
  name: "UserCoreType",
  description: "Full secure profile payload data structure",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    userName: { type: GraphQLString },
    slug: { type: GraphQLString , description: "Auto-generated profile URL slug"},
    email: { type: GraphQLString },
    password: { type: GraphQLString , description: "Hashed credential parameter"},
    bio: { type: GraphQLString },
    phone: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    coverImage: { type: GraphQLString },
    DOB: {
      type: GraphQLString,
      resolve: (parent) => {
        return parent.DOB?.toISOString();
      },
    },
    friends: { type: new GraphQLList(FriendType) },
    friendsRequest: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "FriendsRequestSubField",
          fields: {
            userId: { type: GraphQLID },
            status: { type: StatusGraphQLEnum },
          },
        }),
      ),
    },
    confirmedAt: { type: GraphQLString },
    provider: { type: ProviderGraphQLEnum },
    gender: { type: GendrGraphQLEnum },
    role: { type: RoleGraphQLEnum },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    changeCredentialsTime: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
    restoredAt: { type: GraphQLString },
    freezedAt: { type: GraphQLString },
    unfreezedAt: { type: GraphQLString },
  }),
});
export const OneUserPopulateType: GraphQLObjectType = new GraphQLObjectType({
  name: "UserPopulateType",
  description: "Medium-sized user payload for timeline interactions",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    userName: { type: GraphQLString },
    bio: { type: GraphQLString },
    phone: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    coverImage: { type: GraphQLString },
    DOB: {
      type: GraphQLString,
      resolve: (parent) => {
        return parent.DOB?.toISOString();
      },
    },
    gender: { type: GendrGraphQLEnum },
  }),
});
export const ProfileResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "ProfileResponsePayload",
    fields:()=>( {
      data: {type: OneUserType},
      viewersCount: {type: GraphQLInt},
      viewers: {type: new GraphQLList(ViewerType)},
    }),
}));
export const SearchResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "SearchResponsePayload",
    fields: () => ({
      data: { type: new GraphQLList(OneUserType) },
    }),
}));
export const UploadFileResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "UploadFileResponsePayload",
    fields: () => ({
      Key: { type: new GraphQLNonNull(GraphQLString), description: "S3 Object key reference identifier" }
    }),
}));
export const LogoutResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "LogoutResponsePayload",
    description: "State status returned back post terminating user session tokens",
    fields: () => ({
      status: { type: GraphQLInt },
    }),
}));
export const allFriendsResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "AllFriendsResponsePayload",
    description: "Get all friends",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      profileImage: { type: GraphQLString },
      userName: { type: GraphQLString },
      friends: { type: new GraphQLList(FriendType) },
    }),
}));
export const AllFriendsRequestsResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "AllFriendsRequestsResponsePayload",
    fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    profileImage: { type: GraphQLString },
    userName: { type: GraphQLString },
    friendsRequest: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "RequestsFieldsDetails",
          fields: () => ({
            userId: { type: FriendType, description: "Populated sender user metadata records" }, // 🟢 مسحنا أوبجكت "us" الكارثي واستبدلناه بـ FriendType
            status: { type: StatusGraphQLEnum }
          })
        }),
      ),
    },
  }),
}));
export const ReactResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "ReactActionResponse",
    fields: () => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLID },
    targetId: { type: GraphQLID },
    targetType: { type: TargetTypeGraphQLEnum },
    type: { type: ReactTypeGraphQLEnum },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    message: { type: GraphQLString },
  }),
}));
export const UserMessageResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "UserMessageAckResponse",
    fields: () => ({
      message: { type: new GraphQLNonNull(GraphQLString) },
    }),
}));
export const CreatePreSignedLinkResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "CreatePreSignedLinkResponsePayload",
    fields: () => ({
      url: { type: new GraphQLNonNull(GraphQLString), description: "AWS S3 Pre-signed destination bucket route to directly write binary file arrays" },
      Key: { type: new GraphQLNonNull(GraphQLString) },
    }),
}));
export const GetByPreSignedLinkResponse = new GraphQLNonNull(new GraphQLObjectType({
    name: "GetByPreSignedLinkResponsePayload",
    fields: () => ({
      url: { type: new GraphQLNonNull(GraphQLString) },
    }),
}));
export const OneNotificationType = new GraphQLObjectType({
  name: "NotificationCoreType",
  fields: () => ({
    senderId: { type: new GraphQLNonNull(GraphQLID) },
    recipientId: { type: new GraphQLNonNull(GraphQLID) },
    referenceId: { type: GraphQLID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString), description: "Notification string context description data text" }, // 🟢 تصحيح الـ || الباطلة
    referenceModel: { type: notificationModelGQLEnum },
    isRead: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});
export const RotateTokenResponse = new GraphQLObjectType({
  name: "RotateTokenResponsePayload",
  fields: () => ({
    accessToken: { type: new GraphQLNonNull(GraphQLString) },
    refreshToken: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
export const AllNotificationResponse = new GraphQLObjectType({
  name: "AllNotificationResponsePayload",
  fields: () => ({
    data: { type: new GraphQLList(OneNotificationType) }
  }),
});
