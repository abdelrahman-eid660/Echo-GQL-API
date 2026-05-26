import z from "zod";
import { generalValidationFields } from "../../common/validation";
import { ReactEnum, ReactTargetEnum, StatusEnum } from "../../common/enum";
export const reactValidationGQL = z.strictObject({
  targetId: generalValidationFields.id,
  targetType: z.enum(ReactTargetEnum),
  type: z.enum(ReactEnum),
});
export const getProfileGQL = z.strictObject({
  userId: generalValidationFields.id.optional(),
});
export const searchValidationGQL = z.strictObject({
  search: z.string(),
});

export const notificationValidationGQL = z.strictObject({
  notificationId: generalValidationFields.id,
});
export const attachmentsValidationGQL = z.strictObject({
  Key: z.string(),
});
export const action_friend_requestGQL = z.strictObject({
  userId: generalValidationFields.id,
  status: z.enum(StatusEnum),
});

export const changePasswordGQL = z.strictObject({
    oldPassword: generalValidationFields.password,
    newPassword: generalValidationFields.password,
    confirmPassword: generalValidationFields.confirmPassword,
  })
  .refine(
    (data) => {
      return data.confirmPassword === data.newPassword;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );
export const GraphQLReact = z.strictObject({
  targetId: generalValidationFields.id,
  targetType: z.enum(ReactTargetEnum),
  type: z.enum(ReactEnum),
});
export const CreatePreSignedLinkGQL = z.strictObject({
  path: z.string(),
  OriginalName: z.string(),
  ContentType: z.string(),
});
export const CreatePreSignedLinkGQLResponse = z.strictObject({
  url: z.string(),
  Key: z.string(),
});
export const GetByPreSignedLinkGQL = z.strictObject({
  download: z.string().optional(),
  fileName: z.string().optional(),
  path: z.array(z.string()),
});
export const ReadNotificationGQL = z.strictObject({
  notificationId: generalValidationFields.id,
});
