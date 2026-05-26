import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

export const SignUpGQLTypes = new GraphQLObjectType({
  name: "SignUpResponse",
  description: "Response structure post initiating a new registration payload",
  fields: () => ({
    message: { type: GraphQLString },
  }),
});
export const LoginGQLTypes = new GraphQLObjectType({
  name: "LoginResponse", 
  description: "Identity token wrapper containing access and refresh tokens post verification success",
  fields: () => ({
    accessToken: { type: new GraphQLNonNull(GraphQLString) },
    refreshToken: { type: new GraphQLNonNull(GraphQLString) }, // 🟢 يفضل مستقبلاً تسميتها accessToken و refreshToken بدون الـ _
  }),
});
export const AuthMessageTypes = new GraphQLObjectType({
  name: "AuthMessageResponse",
  description: "Standard messaging acknowledgment response payload for auth operations like OTP verification or password reset",
  fields: () => ({
    message: { type: GraphQLString }
  }),
});
