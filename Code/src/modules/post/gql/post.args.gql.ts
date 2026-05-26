import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { availabilityGraphEnum } from "./post.types.gql";
export const OnePostUpdateArgs = new GraphQLInputObjectType({
    name : "OnePostUpdateArgs",
    description: "Data structure payload for patching existing post fields",
    fields:()=>({
      content: {type : GraphQLString},
      attachments: {type : new GraphQLInputObjectType({
        name : "PostAttachmentsUpdateInput",
        fields : {
            image : {type : new GraphQLList(GraphQLString) || GraphQLString},
            video : {type : new GraphQLList(GraphQLString) || GraphQLString},
        }
      })},
      tags: { type: new GraphQLList(GraphQLID), description: "Updated array of tagged user IDs" },
      mentions: { type: new GraphQLList(GraphQLID), description: "Updated array of mentioned user IDs" },
      availability: {type : availabilityGraphEnum},
    }),
})
export const getPostsArgs = {
    cursor: { type: GraphQLID, description: "Pass the nextCursor received from the previous payload" },
    limit: { type: GraphQLInt, description: "The volume of items requested per page fetch" },
}
export const getPostArgs = {
    postId: { type: new GraphQLNonNull(GraphQLID), description: "The unique Mongo document ID of the targeted post" }, // 🟢 تحويل لـ GraphQLID
};
export const deletePostArgs = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    force: { type: GraphQLBoolean, description: "Set to TRUE to wipe completely from the system instead of soft-deleting" },
};
export const updatePostArgs = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    data: { type: new GraphQLNonNull(OnePostUpdateArgs) },
};
export const createPostArgs = {
    content : {type : GraphQLString},
    attachments : {type : new GraphQLInputObjectType({
        name : "PostAttachmentsCreateInput",
        fields : {
            image : {type : new GraphQLList(GraphQLString)},
            video : {type : new GraphQLList(GraphQLString)},
        }
    })},
    availability : {type : availabilityGraphEnum},
    tags : {type : new GraphQLList(GraphQLID)},
    mentions : {type : new GraphQLList(GraphQLID)},
}
