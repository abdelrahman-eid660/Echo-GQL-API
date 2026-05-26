import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { availabilityEnum } from "../../../common/enum";
import { OneUserPopulateType } from "../../user/gql/user.types.gql";
export const availabilityGraphEnum = new GraphQLEnumType({
    name : "Availability",
    description: "Privacy settings for who can view the post",
    values : {
        Public : {value : availabilityEnum.PUBLIC},
        OnlyFriends : {value : availabilityEnum.ONLYFRIENDS},
        Private : {value : availabilityEnum.PRIVATE},
    }
})
export const OnePostType : GraphQLObjectType = new GraphQLObjectType({
    name : "OnePostType",
    description: "Represents a core post entity within the system",
    fields:()=>({
      _id: {type : new GraphQLNonNull(GraphQLID)},
      Publisher: {type : new GraphQLNonNull(OneUserPopulateType) , description: "The author/publisher profile data"},
      content: {type : GraphQLString},
      attachments: {type : new GraphQLObjectType({
        name : "attachments",
        fields : {
            image : {type : new GraphQLList(GraphQLString), description: "Array of image URLs attached to the post"},
            video : {type : new GraphQLList(GraphQLString), description: "Array of video URLs attached to the post"},
        }
      })},
      userId: { type: GraphQLID, description: "Direct reference to the user ID (useful for flat mutation responses)" },
      tags : {type : new GraphQLList(OneUserPopulateType), description: "Users tagged inside the post container"},
      mentions : {type : new GraphQLList(OneUserPopulateType), description: "Users explicitly mentioned inside the post text"},
      availability: {type : availabilityGraphEnum},
      reactsCount : {type : GraphQLInt , description: "Total reactions received"},
      commentsCount : {type : GraphQLInt, description: "Total comments and replies count"},
      deletedAt : {type : GraphQLString},
      restoredAt : {type : GraphQLString},
      createdAt : {type : GraphQLString},
      updatedAt : {type : GraphQLString},
      unfreezedAt : {type : GraphQLString},
      freezedAt : {type : GraphQLString},
    }),
})
export const createPostType : GraphQLObjectType = new GraphQLObjectType({
    name : "CreatePostTypeResponse",
    fields:()=>({
      _id: {type : new GraphQLNonNull(GraphQLID)},
      userId: {type : new GraphQLNonNull(GraphQLID)},
      content: {type : GraphQLString},
      attachments: {type : new GraphQLObjectType({
        name : "Create_Post_attachments",
        fields : {
            image : {type : new GraphQLList(GraphQLString) || GraphQLString},
            video : {type : new GraphQLList(GraphQLString) || GraphQLString},
        }
      })},
      tags : {type : new GraphQLList(OneUserPopulateType)},
      mentions : {type : new GraphQLList(OneUserPopulateType)},
      availability: {type : availabilityGraphEnum},
      reactsCount : {type : GraphQLInt},
      commentsCount : {type : GraphQLInt},
      deletedAt : {type : GraphQLString},
      restoredAt : {type : GraphQLString},
      createdAt : {type : GraphQLString},
      updatedAt : {type : GraphQLString},
      unfreezedAt : {type : GraphQLString},
      freezedAt : {type : GraphQLString},
    }),
})
export const OnePostUpdateType : GraphQLObjectType = new GraphQLObjectType({
    name : "OnePostUpdateType",
    fields:()=>({
      _id: {type : GraphQLID},
      userId: {type : GraphQLID},
      content: {type : GraphQLString},
      attachments: {type : new GraphQLObjectType({
        name : "attachmentsUpdate",
        fields : {
            image : {type : new GraphQLList(GraphQLString) || GraphQLString},
            video : {type : new GraphQLList(GraphQLString) || GraphQLString},
        }
      })},
      tags : {type : new GraphQLList(OneUserPopulateType)},
      mentions : {type : new GraphQLList(OneUserPopulateType)},
      availability: {type : availabilityGraphEnum},
      reactsCount : {type : GraphQLInt},
      commentsCount : {type : GraphQLInt},
      deletedAt : {type : GraphQLString},
      restoredAt : {type : GraphQLString},
      createdAt : {type : GraphQLString},
      updatedAt : {type : GraphQLString},
      unfreezedAt : {type : GraphQLString},
      freezedAt : {type : GraphQLString},
    }),
})
export const GetPostsResponse = new GraphQLNonNull(new GraphQLObjectType({
    name : "GetPostsResponse",
    description: "Wrapped list payload supporting infinite scroll pagination",
    fields : {
        data : {type : new GraphQLObjectType({
            name : "PostPagination",
            fields : {
                posts : {type : new GraphQLList(OnePostType)},
                nextCursor: { type: GraphQLID, description: "The timestamp or ID boundary for the next chunk of posts" },
                hasMore: { type: GraphQLBoolean, description: "Flag to inform the UI if extra pages are left to fetch" },
            }
        })}
    }
}))
export const GetPostResponse = new GraphQLNonNull(new GraphQLObjectType({
    name : "GetPostResponse",
    description: "Wrapped payload for locating a solitary post record",
    fields : {
        data : {type : new GraphQLObjectType({
            name : "GetPostByIdPayload",
            fields : {
                post : {type : OnePostType},
            }
        })}
    }
}))
export const Message = new GraphQLNonNull(new GraphQLObjectType({
    name: "PostMessageResponse",
    description: "Standard text acknowledgment post mutation lifecycle events",
    fields: {
      message: { type: new GraphQLNonNull(GraphQLString) },
    },
  }),
);