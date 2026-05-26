"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadNotificationGQL = exports.GetByPreSignedLinkGQL = exports.CreatePreSignedLinkGQLResponse = exports.CreatePreSignedLinkGQL = exports.GraphQLReact = exports.changePasswordGQL = exports.action_friend_requestGQL = exports.attachmentsValidationGQL = exports.notificationValidationGQL = exports.searchValidationGQL = exports.getProfileGQL = exports.reactValidationGQL = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_1 = require("../../common/validation");
const enum_1 = require("../../common/enum");
exports.reactValidationGQL = zod_1.default.strictObject({
    targetId: validation_1.generalValidationFields.id,
    targetType: zod_1.default.enum(enum_1.ReactTargetEnum),
    type: zod_1.default.enum(enum_1.ReactEnum),
});
exports.getProfileGQL = zod_1.default.strictObject({
    userId: validation_1.generalValidationFields.id.optional(),
});
exports.searchValidationGQL = zod_1.default.strictObject({
    search: zod_1.default.string(),
});
exports.notificationValidationGQL = zod_1.default.strictObject({
    notificationId: validation_1.generalValidationFields.id,
});
exports.attachmentsValidationGQL = zod_1.default.strictObject({
    Key: zod_1.default.string(),
});
exports.action_friend_requestGQL = zod_1.default.strictObject({
    userId: validation_1.generalValidationFields.id,
    status: zod_1.default.enum(enum_1.StatusEnum),
});
exports.changePasswordGQL = zod_1.default.strictObject({
    oldPassword: validation_1.generalValidationFields.password,
    newPassword: validation_1.generalValidationFields.password,
    confirmPassword: validation_1.generalValidationFields.confirmPassword,
})
    .refine((data) => {
    return data.confirmPassword === data.newPassword;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
exports.GraphQLReact = zod_1.default.strictObject({
    targetId: validation_1.generalValidationFields.id,
    targetType: zod_1.default.enum(enum_1.ReactTargetEnum),
    type: zod_1.default.enum(enum_1.ReactEnum),
});
exports.CreatePreSignedLinkGQL = zod_1.default.strictObject({
    path: zod_1.default.string(),
    OriginalName: zod_1.default.string(),
    ContentType: zod_1.default.string(),
});
exports.CreatePreSignedLinkGQLResponse = zod_1.default.strictObject({
    url: zod_1.default.string(),
    Key: zod_1.default.string(),
});
exports.GetByPreSignedLinkGQL = zod_1.default.strictObject({
    download: zod_1.default.string().optional(),
    fileName: zod_1.default.string().optional(),
    path: zod_1.default.array(zod_1.default.string()),
});
exports.ReadNotificationGQL = zod_1.default.strictObject({
    notificationId: validation_1.generalValidationFields.id,
});
