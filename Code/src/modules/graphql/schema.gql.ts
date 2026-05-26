import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userSchema } from "../user/gql";
import { postSchema } from "../post/gql";
import { commentSchema } from "../comment/gql";
import { authGQLSchema } from "../auth/gql";
import { storySchema } from "../story/gql";
import { chatschema } from "../chat/gql";
export const query = new GraphQLObjectType({
  name: "Social_Media_Query",
  fields: {
    ...userSchema.registerQuery(),
    ...postSchema.registerQuery(),
    ...commentSchema.registerQuery(),
    ...storySchema.registerQuery(),
    ...chatschema.registerQuery(),

  },
});
const mutation = new GraphQLObjectType({
  name: "Social_Media_Mutation",
  fields: {
    ...authGQLSchema.registerAuthMutation(),
    ...userSchema.registerMutation(),
    ...postSchema.registerMutation(),
    ...commentSchema.registerMutation(),
    ...storySchema.registerMutation(),
    ...chatschema.registerMutation(),
  },
});

export const schema = new GraphQLSchema({ query, mutation });
