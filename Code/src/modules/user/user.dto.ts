import z from "zod";
import {  action_friend_requestGQL, attachmentsValidationGQL, changePasswordGQL, CreatePreSignedLinkGQL, GetByPreSignedLinkGQL, getProfileGQL, GraphQLReact, notificationValidationGQL, searchValidationGQL } from "./user.validation";

export type getProfileGQLDTO = z.infer<typeof getProfileGQL>
export type searchValidationGQLDTO = z.infer<typeof searchValidationGQL>
export type changePasswordGQLDTO = z.infer<typeof changePasswordGQL>
export type notificationValidationGQLDTO = z.infer<typeof notificationValidationGQL>
export type action_friend_requestGQLDTO = z.infer<typeof action_friend_requestGQL>
export type ReactGQLDTO = z.infer<typeof GraphQLReact>
export type GetByPreSignedLinkGQLDTO = z.infer<typeof GetByPreSignedLinkGQL>
export type CreatePreSignedLinkGQLDTO = z.infer<typeof CreatePreSignedLinkGQL>
export type attachmentsValidationGQLDTO = z.infer<typeof attachmentsValidationGQL>