import { IGenerateToken } from "../../../common/service";
import { GraphQLValidation } from "../../../middleware";
import { ConfirmOTPGQLDTO, LoginGQLDTO, ResetPasswordGQLDTO, SignupGQLDTO, ResendConfirmEmailGQLDTO, ForgetPasswordGQLDTO } from "../auth.dto";
import { authService, AuthService } from "../auth.service";
import { ConfirmOTPGQL, ForgetPasswordGQL, LoginGQL, ResendConfirmEmailGQL, ResetPasswordGQL, SignUpGQL } from "../auth.validation";

export class AuthGQLResolver {
  private authService: AuthService;
  constructor() {
    this.authService = authService;
  }
  signUp = async (parent: unknown, args: SignupGQLDTO):Promise<{message : string}> => {
    await GraphQLValidation(SignUpGQL , args)
    const message = await this.authService.signup(args);
    return { message};
  };
  resendConfirmEmail = async (parent: unknown, args: ResendConfirmEmailGQLDTO):Promise<{message : string}> => {
    await GraphQLValidation(ResendConfirmEmailGQL , args)
    const message = await this.authService.resendConfirmEmail(args);
    return { message};
  };
  confirmEmail = async (parent: unknown, args: ConfirmOTPGQLDTO):Promise<{message : string}> => {
    await GraphQLValidation(ConfirmOTPGQL , args)
    const message = await this.authService.confirmEmail(args);
    return { message};
  };
  login = async (parent: unknown, args: LoginGQLDTO , context : any ): Promise<IGenerateToken> => {
    await GraphQLValidation(LoginGQL , args )
    const { accessToken , refreshToken} = await this.authService.login(args , context.ip);
    return { accessToken , refreshToken};
  };
  forgetPassword = async (parent: unknown, args : ForgetPasswordGQLDTO , context : any  ):Promise<{message : string}>=> {
    await GraphQLValidation(ForgetPasswordGQL , args )
    const message = await this.authService.forgetPassword(args);
    return{message};
  };
  confirmForgetPassword = async (parent: unknown, args: ConfirmOTPGQLDTO):Promise<{message : string}>=> {
    await GraphQLValidation(ConfirmOTPGQL , args )
    const message = await this.authService.confirmForgetPassword(args);
    return { message};
  };
  resetPassword = async(parent : unknown , args : ResetPasswordGQLDTO):Promise<{message : string}>=>{
    await GraphQLValidation(ResetPasswordGQL , args )
    console.log(args);
    
    const message = await this.authService.resetPassword(args)
    console.log(message);
    
    return {message}
  }
  loginWithGmail = async (parent: unknown, { idToken } : {idToken : string} , context : any ): Promise<IGenerateToken> => {
    const { accessToken , refreshToken} = await this.authService.loginWithGmail({idToken} , context.ip);
    return { accessToken , refreshToken};
  };
  signupWithGmail = async (parent: unknown, { idToken } : {idToken : string} , context : any ) => {
    const data = await this.authService.signupWithGmail({idToken} , context.ip);
    return { data};
  };
}
export const authGQLResolver = new AuthGQLResolver();
