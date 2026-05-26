import z from "zod"
import { ConfirmOTPGQL, ForgetPasswordGQL, LoginGQL, ResendConfirmEmailGQL, ResetPasswordGQL, SignUpGQL } from "./auth.validation"

export type LoginGQLDTO = z.infer<typeof LoginGQL>
export type SignupGQLDTO = z.infer<typeof SignUpGQL>
export type ConfirmOTPGQLDTO = z.infer<typeof ConfirmOTPGQL>
export type ResetPasswordGQLDTO = z.infer<typeof ResetPasswordGQL>
export type ResendConfirmEmailGQLDTO = z.infer<typeof ResendConfirmEmailGQL>
export type ForgetPasswordGQLDTO = z.infer<typeof ForgetPasswordGQL>