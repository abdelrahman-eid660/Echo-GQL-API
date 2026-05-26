"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGQLSchema = exports.AuthGQLSchema = void 0;
const AuthGQLTypes = __importStar(require("./auth.types.gql"));
const AuthGQLArgs = __importStar(require("./auth.args.gql"));
const auth_resolver_1 = require("./auth.resolver");
class AuthGQLSchema {
    authGQLResolver;
    constructor() {
        this.authGQLResolver = auth_resolver_1.authGQLResolver;
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
exports.AuthGQLSchema = AuthGQLSchema;
exports.authGQLSchema = new AuthGQLSchema();
