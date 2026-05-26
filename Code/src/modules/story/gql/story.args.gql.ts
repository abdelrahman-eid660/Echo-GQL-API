import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { availabilityGraphEnum } from "../../post/gql/post.types.gql";
export const StoryAttachmentsInput = new GraphQLInputObjectType({
  name: "StoryAttachmentsInput",
  fields: {
    image: { type: new GraphQLList(GraphQLString) },
    video: { type: new GraphQLList(GraphQLString) },
  },
});
export const createStoryArgs = {
  content: { type: GraphQLString },
  attachments: { type: StoryAttachmentsInput },
  tags: { type: new GraphQLList(GraphQLID) },
  mentions: { type: new GraphQLList(GraphQLID) },
  availability: { type: availabilityGraphEnum },
};
export const updateStoryArgs = {
  storyId: { type: new GraphQLNonNull(GraphQLID) },
  availability: { type: availabilityGraphEnum },
  mentions: { type: new GraphQLList(GraphQLID) },
};
export const getStoriesArgs = {
  limit: { type: GraphQLInt },
  cursor: { type: GraphQLID },
};
export const getUserStoriesArgs = {
  userId: { type: new GraphQLNonNull(GraphQLID) },
};
export const getViewerAndReactsStoriesArgs = {
  userId: { type: new GraphQLNonNull(GraphQLID) },
  storyId: { type: new GraphQLNonNull(GraphQLID) },
};
export const watchStoryArgs = {
  storyId: { type: new GraphQLNonNull(GraphQLID) },
};
export const deleteStoryArgs = {
  storyId: { type: new GraphQLNonNull(GraphQLID) },
};
