"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GqlError = void 0;
const graphql_1 = require("graphql");
const GqlError = (error) => {
    throw new graphql_1.GraphQLError(error.message || 'Internal server error', { extensions: {
            code: error.name || "INTERNAL_SERVER_ERROR",
            statusCode: error.statusCode || 500,
            cause: error.cause || null
        } });
};
exports.GqlError = GqlError;
