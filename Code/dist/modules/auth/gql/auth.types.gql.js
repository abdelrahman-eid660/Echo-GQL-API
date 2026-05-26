"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageTypes = exports.LoginGQLTypes = exports.SignUpGQLTypes = void 0;
const graphql_1 = require("graphql");
exports.SignUpGQLTypes = new graphql_1.GraphQLObjectType({
    name: "SignUpResponse",
    description: "Response structure post initiating a new registration payload",
    fields: () => ({
        message: { type: graphql_1.GraphQLString },
    }),
});
exports.LoginGQLTypes = new graphql_1.GraphQLObjectType({
    name: "LoginResponse",
    description: "Identity token wrapper containing access and refresh tokens post verification success",
    fields: () => ({
        accessToken: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        refreshToken: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
});
exports.AuthMessageTypes = new graphql_1.GraphQLObjectType({
    name: "AuthMessageResponse",
    description: "Standard messaging acknowledgment response payload for auth operations like OTP verification or password reset",
    fields: () => ({
        message: { type: graphql_1.GraphQLString }
    }),
});
