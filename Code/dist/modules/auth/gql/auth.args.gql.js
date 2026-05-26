"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPasswordGQLArgs = exports.resetPasswordGQLArgs = exports.loginWithGoogleGQLArgs = exports.loginGQLArgs = exports.confirmOtpGQLArgs = exports.resendConfirmOtpGQLArgs = exports.signUpGQLArgs = void 0;
const graphql_1 = require("graphql");
const enum_1 = require("../../../common/enum");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const GenderGQLEnum = new graphql_1.GraphQLEnumType({
    name: "Gender_auth_Response",
    values: {
        Male: { value: enum_1.GenderEnum.MALE },
        Female: { value: enum_1.GenderEnum.FEMALE },
    },
});
exports.signUpGQLArgs = {
    firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    confirmPassword: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    userName: { type: graphql_1.GraphQLString },
    bio: { type: graphql_1.GraphQLString },
    phone: { type: graphql_1.GraphQLString },
    profileImage: { type: graphql_1.GraphQLString },
    coverImage: { type: graphql_1.GraphQLString },
    DOB: { type: graphql_1.GraphQLString },
    provider: { type: user_types_gql_1.ProviderGraphQLEnum },
    gender: { type: GenderGQLEnum },
    role: { type: user_types_gql_1.RoleGraphQLEnum },
};
exports.resendConfirmOtpGQLArgs = {
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.confirmOtpGQLArgs = {
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    otp: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.loginGQLArgs = {
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    FCM: { type: graphql_1.GraphQLString, description: "Firebase Cloud Messaging device token for push notifications" },
};
exports.loginWithGoogleGQLArgs = {
    idToken: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "OAuth2 credential token extracted from Google client payload" },
    issuer: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.resetPasswordGQLArgs = {
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.forgetPasswordGQLArgs = {
    email: { type: graphql_1.GraphQLString, description: "Required if resetting validation state via mailbox" },
    phone: { type: graphql_1.GraphQLString, description: "Required if resetting validation state via SMS carrier" },
};
