import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { ReactTypeGraphQLEnum, StatusGraphQLEnum, TargetTypeGraphQLEnum } from "./user.types.gql";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

export const profileArgs = {
  search: { type: GraphQLString, description: "Optional name/username filter string for filtering user scopes" },
  userId: { type: GraphQLID },
};
export const logoutArgs = { 
  flag: { type: new GraphQLNonNull(GraphQLInt), description: "Termination strategy context identifier '0' for logout from all devices and '1' for current device" }
};
export const s3KeyArgs = {
    Key : {type : new GraphQLNonNull(GraphQLString)}
}
export const userIdArgs = {
    userId : {type : new GraphQLNonNull(GraphQLID)}
}
export const searchArgs = {
  search: { type: new GraphQLNonNull(GraphQLString), description: "Query parameter text used to hit user indices" } // 🟢 تصحيح التايب من ID لـ String
};
export const notificationIdArgs = {
    notificationId : {type : new GraphQLNonNull(GraphQLID)}
}
export const actionOfRequestFriendArgs = { 
  userId: { type: new GraphQLNonNull(GraphQLID), description: "Target user individual context packet" },
  status: { type: StatusGraphQLEnum }
};
export const reactArgsGQL = {
    targetId: { type: new GraphQLNonNull(GraphQLID), description: "Entity document identifier receiving reaction log" },
    targetType: { type: TargetTypeGraphQLEnum },
    type: { type: ReactTypeGraphQLEnum },
}
export const fileArgsGQL = {
  file: {
    type: new GraphQLNonNull(
      GraphQLUpload
    )
  }
};
export const updatePasswordArgs = {
    oldPassword : {type : new GraphQLNonNull(GraphQLString)},
    newPassword : {type : new GraphQLNonNull(GraphQLString)},
    confirmPassword : {type : new GraphQLNonNull(GraphQLString)},
}
export const createPreSignedLinkArgs = {
  ContentType: { type: new GraphQLNonNull(GraphQLString), description: "Mime-type configuration structure like image/jpeg" },
  OriginalName: { type: new GraphQLNonNull(GraphQLString) },
  path: { type: new GraphQLNonNull(GraphQLString), description: "Target internal S3 folder prefix tier configuration ==> 1- users/userId/ for users 2- posts/userId/ for posts 3- comments/userId/postId for  comments 4- comments/userId/postId/commentId for replay comments 4- stories/userId for stories 5- chats/chatId/messages" }
};
export const getByPreSignedLinkArgs = {
    download : {type : GraphQLString},
    fileName : {type : GraphQLString},
    path : {type : new GraphQLNonNull(new GraphQLList(GraphQLString))}
}