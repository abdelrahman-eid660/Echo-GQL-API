"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGQLResolver = exports.AuthGQLResolver = void 0;
const middleware_1 = require("../../../middleware");
const auth_service_1 = require("../auth.service");
const auth_validation_1 = require("../auth.validation");
class AuthGQLResolver {
    authService;
    constructor() {
        this.authService = auth_service_1.authService;
    }
    signUp = async (parent, args) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.SignUpGQL, args);
        const message = await this.authService.signup(args);
        return { message };
    };
    resendConfirmEmail = async (parent, args) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.ResendConfirmEmailGQL, args);
        const message = await this.authService.resendConfirmEmail(args);
        return { message };
    };
    confirmEmail = async (parent, args) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.ConfirmOTPGQL, args);
        const message = await this.authService.confirmEmail(args);
        return { message };
    };
    login = async (parent, args, context) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.LoginGQL, args);
        const { accessToken, refreshToken } = await this.authService.login(args, context.ip);
        return { accessToken, refreshToken };
    };
    forgetPassword = async (parent, args, context) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.ForgetPasswordGQL, args);
        const message = await this.authService.forgetPassword(args);
        return { message };
    };
    confirmForgetPassword = async (parent, args) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.ConfirmOTPGQL, args);
        const message = await this.authService.confirmForgetPassword(args);
        return { message };
    };
    resetPassword = async (parent, args) => {
        await (0, middleware_1.GraphQLValidation)(auth_validation_1.ResetPasswordGQL, args);
        console.log(args);
        const message = await this.authService.resetPassword(args);
        console.log(message);
        return { message };
    };
    loginWithGmail = async (parent, { idToken }, context) => {
        const { accessToken, refreshToken } = await this.authService.loginWithGmail({ idToken }, context.ip);
        return { accessToken, refreshToken };
    };
    signupWithGmail = async (parent, { idToken }, context) => {
        const data = await this.authService.signupWithGmail({ idToken }, context.ip);
        return { data };
    };
}
exports.AuthGQLResolver = AuthGQLResolver;
exports.authGQLResolver = new AuthGQLResolver();
