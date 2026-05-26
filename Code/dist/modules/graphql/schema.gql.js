"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.query = void 0;
const graphql_1 = require("graphql");
const gql_1 = require("../user/gql");
const gql_2 = require("../post/gql");
const gql_3 = require("../comment/gql");
const gql_4 = require("../auth/gql");
const gql_5 = require("../story/gql");
const gql_6 = require("../chat/gql");
exports.query = new graphql_1.GraphQLObjectType({
    name: "Social_Media_Query",
    fields: {
        ...gql_1.userSchema.registerQuery(),
        ...gql_2.postSchema.registerQuery(),
        ...gql_3.commentSchema.registerQuery(),
        ...gql_5.storySchema.registerQuery(),
        ...gql_6.chatschema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "Social_Media_Mutation",
    fields: {
        ...gql_4.authGQLSchema.registerAuthMutation(),
        ...gql_1.userSchema.registerMutation(),
        ...gql_2.postSchema.registerMutation(),
        ...gql_3.commentSchema.registerMutation(),
        ...gql_5.storySchema.registerMutation(),
        ...gql_6.chatschema.registerMutation(),
    },
});
exports.schema = new graphql_1.GraphQLSchema({ query: exports.query, mutation });
