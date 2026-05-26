import { GraphQLError } from "graphql"

export const GqlError = (error : any)=>{
    throw new GraphQLError(error.message || 'Internal server error' , {extensions : {
        code: error.name || "INTERNAL_SERVER_ERROR",
        statusCode: error.statusCode || 500,
        cause: error.cause || null}})
}