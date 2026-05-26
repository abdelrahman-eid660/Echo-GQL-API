"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordGQL = exports.ResendConfirmEmailGQL = exports.ForgetPasswordGQL = exports.ConfirmOTPGQL = exports.SignUpGQL = exports.LoginGQL = void 0;
const zod_1 = require("zod");
const enum_1 = require("../../common/enum");
const validation_1 = require("../../common/validation");
exports.LoginGQL = zod_1.z.strictObject({
    email: validation_1.generalValidationFields.email,
    password: validation_1.generalValidationFields.password,
    FCM: zod_1.z.string().optional(),
});
exports.SignUpGQL = zod_1.z
    .strictObject({
    email: validation_1.generalValidationFields.email,
    password: validation_1.generalValidationFields.password,
    FCM: zod_1.z.string().optional(),
    firstName: validation_1.generalValidationFields.firstName,
    lastName: validation_1.generalValidationFields.lastName,
    userName: validation_1.generalValidationFields.userName.optional(),
    confirmPassword: validation_1.generalValidationFields.confirmPassword,
    bio: zod_1.z.string().optional(),
    phone: validation_1.generalValidationFields.phone.optional(),
    profileImage: zod_1.z.string().optional(),
    coverImage: zod_1.z.string().optional(),
    DOB: zod_1.z.coerce.date().optional(),
    provider: zod_1.z.enum(enum_1.ProviderEnum).optional(),
    gender: zod_1.z.enum(enum_1.GenderEnum).optional(),
    role: zod_1.z.enum(enum_1.RoleEnum).optional(),
})
    .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });
    }
});
exports.ConfirmOTPGQL = zod_1.z.strictObject({
    email: validation_1.generalValidationFields.email,
    otp: validation_1.generalValidationFields.otp,
});
exports.ForgetPasswordGQL = zod_1.z.strictObject({
    email: validation_1.generalValidationFields.email,
    phone: validation_1.generalValidationFields.phone.optional(),
});
exports.ResendConfirmEmailGQL = zod_1.z.strictObject({
    email: validation_1.generalValidationFields.email,
});
exports.ResetPasswordGQL = zod_1.z.strictObject({
    email: validation_1.generalValidationFields.email,
    password: validation_1.generalValidationFields.password,
});
