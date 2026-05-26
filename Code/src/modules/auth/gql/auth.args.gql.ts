import { GraphQLEnumType, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../common/enum";
import { ProviderGraphQLEnum, RoleGraphQLEnum } from "../../user/gql/user.types.gql";
const GenderGQLEnum = new GraphQLEnumType({
  name: "Gender_auth_Response",
  values: {
    Male: { value: GenderEnum.MALE },
    Female: { value: GenderEnum.FEMALE },
  },
});
export const signUpGQLArgs = {
  firstName: { type: new GraphQLNonNull(GraphQLString) },
  lastName: { type: new GraphQLNonNull(GraphQLString) },
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
  userName: { type: GraphQLString },
  bio: { type: GraphQLString },
  phone: { type: GraphQLString },
  profileImage: { type: GraphQLString },
  coverImage: { type: GraphQLString },
  DOB: { type: GraphQLString },
  provider: { type: ProviderGraphQLEnum },
  gender: { type: GenderGQLEnum },
  role: { type: RoleGraphQLEnum },
};
export const resendConfirmOtpGQLArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
};
export const confirmOtpGQLArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
  otp: { type: new GraphQLNonNull(GraphQLString) },
};
export const loginGQLArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  FCM: { type: GraphQLString, description: "Firebase Cloud Messaging device token for push notifications" },
};
export const loginWithGoogleGQLArgs = {
  idToken: { type: new GraphQLNonNull(GraphQLString), description: "OAuth2 credential token extracted from Google client payload" },
  issuer: { type: new GraphQLNonNull(GraphQLString) },
};
export const resetPasswordGQLArgs = {
  email: { type: new GraphQLNonNull(GraphQLString) },
  password: { type: new GraphQLNonNull(GraphQLString) },
};
export const forgetPasswordGQLArgs = {
  email: { type: GraphQLString, description: "Required if resetting validation state via mailbox" },
  phone: { type: GraphQLString, description: "Required if resetting validation state via SMS carrier" },
};

