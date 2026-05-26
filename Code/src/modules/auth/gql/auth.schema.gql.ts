import * as AuthGQLTypes from "./auth.types.gql";
import * as AuthGQLArgs from "./auth.args.gql";
import { authGQLResolver, AuthGQLResolver } from "./auth.resolver";

export class AuthGQLSchema {
  private authGQLResolver: AuthGQLResolver;
  constructor() {
    this.authGQLResolver = authGQLResolver;
  }
  registerAuthMutation() {
    return {
      signUp: {
        type: AuthGQLTypes.SignUpGQLTypes,
        args: AuthGQLArgs.signUpGQLArgs,
        resolve: this.authGQLResolver.signUp,
      },
      confirmEmail: {
        type: AuthGQLTypes.SignUpGQLTypes,
        args: AuthGQLArgs.confirmOtpGQLArgs,
        resolve: this.authGQLResolver.confirmEmail,
      },
      resendConfirmEmail: {
        type: AuthGQLTypes.SignUpGQLTypes,
        args: AuthGQLArgs.resendConfirmOtpGQLArgs,
        resolve: this.authGQLResolver.resendConfirmEmail,
      },
      login: {
        type: AuthGQLTypes.LoginGQLTypes,
        args: AuthGQLArgs.loginGQLArgs,
        resolve: this.authGQLResolver.login,
      },
      forgetPassword: {
        type: AuthGQLTypes.SignUpGQLTypes,
        args: AuthGQLArgs.forgetPasswordGQLArgs,
        resolve: this.authGQLResolver.forgetPassword,
      },
      confirmForgetPassword: {
        type: AuthGQLTypes.SignUpGQLTypes,
        args: AuthGQLArgs.confirmOtpGQLArgs,
        resolve: this.authGQLResolver.confirmForgetPassword,
      },
      resetPassword: {
        type: AuthGQLTypes.AuthMessageTypes,
        args: AuthGQLArgs.resetPasswordGQLArgs,
        resolve: this.authGQLResolver.resetPassword,
      },
      signupWithGmail: {
        type: AuthGQLTypes.LoginGQLTypes,
        args: AuthGQLArgs.loginWithGoogleGQLArgs,
        resolve: this.authGQLResolver.signupWithGmail,
      },
      loginWithGmail: {
        type: AuthGQLTypes.LoginGQLTypes,
        args: AuthGQLArgs.loginWithGoogleGQLArgs,
        resolve: this.authGQLResolver.loginWithGmail,
      },
    };
  }
}
export const authGQLSchema = new AuthGQLSchema();
