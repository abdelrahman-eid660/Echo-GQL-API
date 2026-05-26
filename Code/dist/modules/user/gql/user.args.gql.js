"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByPreSignedLinkArgs = exports.createPreSignedLinkArgs = exports.updatePasswordArgs = exports.fileArgsGQL = exports.reactArgsGQL = exports.actionOfRequestFriendArgs = exports.notificationIdArgs = exports.searchArgs = exports.userIdArgs = exports.s3KeyArgs = exports.logoutArgs = exports.profileArgs = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("./user.types.gql");
const GraphQLUpload_mjs_1 = __importDefault(require("graphql-upload/GraphQLUpload.mjs"));
exports.profileArgs = {
    search: { type: graphql_1.GraphQLString, description: "Optional name/username filter string for filtering user scopes" },
    userId: { type: graphql_1.GraphQLID },
};
exports.logoutArgs = {
    flag: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt), description: "Termination strategy context identifier '0' for logout from all devices and '1' for current device" }
};
exports.s3KeyArgs = {
    Key: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
};
exports.userIdArgs = {
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
};
exports.searchArgs = {
    search: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "Query parameter text used to hit user indices" }
};
exports.notificationIdArgs = {
    notificationId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
};
exports.actionOfRequestFriendArgs = {
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "Target user individual context packet" },
    status: { type: user_types_gql_1.StatusGraphQLEnum }
};
exports.reactArgsGQL = {
    targetId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID), description: "Entity document identifier receiving reaction log" },
    targetType: { type: user_types_gql_1.TargetTypeGraphQLEnum },
    type: { type: user_types_gql_1.ReactTypeGraphQLEnum },
};
exports.fileArgsGQL = {
    file: {
        type: new graphql_1.GraphQLNonNull(GraphQLUpload_mjs_1.default)
    }
};
exports.updatePasswordArgs = {
    oldPassword: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    newPassword: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    confirmPassword: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.createPreSignedLinkArgs = {
    ContentType: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "Mime-type configuration structure like image/jpeg" },
    OriginalName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    path: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "Target internal S3 folder prefix tier configuration ==> 1- users/userId/ for users 2- posts/userId/ for posts 3- comments/userId/postId for  comments 4- comments/userId/postId/commentId for replay comments 4- stories/userId for stories 5- chats/chatId/messages" }
};
exports.getByPreSignedLinkArgs = {
    download: { type: graphql_1.GraphQLString },
    fileName: { type: graphql_1.GraphQLString },
    path: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLString)) }
};
