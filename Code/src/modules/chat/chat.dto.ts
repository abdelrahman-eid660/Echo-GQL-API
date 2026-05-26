import z from "zod";
import { addParticipantsGQL, createGroupGQL, getChatGQL, removeOrPormotionOrLeaveParticipantGQL, sendMessageGQL, typingStatusGQL } from "./chat.validation";
export type getChatGQLDTO = z.infer<typeof getChatGQL>
export type createGroupGQLDTO = z.infer<typeof createGroupGQL>
export type sendMessageGQLDTO = z.infer<typeof sendMessageGQL>
export type addParticipantsGQLDTO = z.infer<typeof addParticipantsGQL>
export type removeOrPormotionOrLeaveParticipantGQLDTO = z.infer<typeof removeOrPormotionOrLeaveParticipantGQL>
export type typingStatusGQLDTO = z.infer<typeof typingStatusGQL>