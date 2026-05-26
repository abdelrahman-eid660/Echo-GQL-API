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
import { availabilityGraphEnum } from "../../post/gql/post.types.gql";
import { ReactEnum, ReactTargetEnum } from "../../../common/enum";
import { IStory } from "../../../common/interface";
import { OneUserPopulateType } from "../../user/gql/user.types.gql";
export const ReactGQLEnum = new GraphQLEnumType({
  name: "ReactEnumGQL",
  description: "All supported reactions types inside the application",
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
export const ReactTargetGQLEnum = new GraphQLEnumType({
  name: "ReactTargetEnumGQL",
  description: "Identifies the target entity receiving the reaction packet",
  values: {
    Comment: { value: ReactTargetEnum.COMMENT },
    Message: { value: ReactTargetEnum.MESSAGE },
    Post: { value: ReactTargetEnum.POST },
    Story: { value: ReactTargetEnum.STORY },
    User: { value: ReactTargetEnum.USER },
  },
});
export const OneStoryType: GraphQLObjectType = new GraphQLObjectType({
  name: "StoryType",
  description: "Core entity representing a single story block",
  fields: ()=>({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    Publisher: { type: OneUserPopulateType, description: "Populated publisher user data" },
    content: { type: GraphQLString },
    expiresAt: { type: new GraphQLNonNull(GraphQLString) , description: "Auto-deletion timestamp (24-hour mark)" },
    attachments: {
      type: new GraphQLObjectType({
        name: "StoryAttachmentsResponse",
        fields: {
          image: { type: new GraphQLList(GraphQLString) },
          video: { type: new GraphQLList(GraphQLString) },
        },
      }),
    },
    tags: { type: new GraphQLList(GraphQLID) },
    mentions: { type: new GraphQLList(GraphQLID) },
    availability: { type: availabilityGraphEnum },
    reactsCount: { type: GraphQLInt },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
    isOwner: { type: GraphQLBoolean, description: "True if the requesting user created this story" },
    isViewed: { type: GraphQLBoolean, description: "True if the current user has already watched this slice" },
    currentUserReact: { type: ReactGQLEnum, description: "The active reaction type left by the client user" },
  }),
});
export const GetUserStoriesResponse: GraphQLObjectType = new GraphQLObjectType({
  name: "GetUserStoriesResponse",
  description: "Returns a bundle of active stories for a targeted profile",
  fields: () => ({
    stories: { type: new GraphQLNonNull(new GraphQLList(OneStoryType)) },
  }),
});
export const GetViewerAndReactsStoriesResponse: GraphQLObjectType =new GraphQLObjectType({
  name: "GetViewerAndReactsStoriesResponse",
  description: "Analytics response holding logs of people who viewed/reacted to a story slice",
    fields: {
      stories: {
        type: new GraphQLNonNull(
          new GraphQLList(
            new GraphQLObjectType({
              name: "StoryAnalyticsPayload",
              fields:()=>( {
                viewer: { type: new GraphQLNonNull(OneUserPopulateType),description: "The profile that viewed the story"},
                reacts: {
                  type: new GraphQLNonNull(
                    new GraphQLObjectType({
                      name: "StoryReactDetails",
                      fields: () => ({
                        _id: { type: new GraphQLNonNull(GraphQLID) },
                        userId: { type: new GraphQLNonNull(OneUserPopulateType) }, // 🟢 استبدال الـ Duplicate بـ التايب الجاهز
                        targetId: { type: new GraphQLNonNull(GraphQLID) },
                        targetType: { type: ReactTargetGQLEnum },
                        type: { type: ReactGQLEnum },
                        createdAt: { type: new GraphQLNonNull(GraphQLString) },
                      }),
                    }),
                  ),
                },
                viewsCount: { type: GraphQLInt },
              }),
            }),
          ),
        ),
      },
    },
});
export const GetStoriesResponse: GraphQLObjectType = new GraphQLObjectType({
  name: "GetStoriesResponse",
  description: "Paginated feed containing chronological circle stories",
  fields: ()=>({
    stories: { type: new GraphQLNonNull(new GraphQLList(OneStoryType)) },
    nextCursor: { type: GraphQLID },
    hasMore: { type: GraphQLBoolean },
  }),
});
export const StoryMessageResponse = new GraphQLObjectType({
  name: "StoryMessageResponse",
  fields: () => ({
    message: { type: GraphQLString },
  }),
});
export type StoryWithViews = IStory & { viewsCount?: number };
