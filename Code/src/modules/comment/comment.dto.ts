import z from "zod";
import { creatCommentGQLValidation, getAllCommentsGQLValidation, getCommentGQLValidation, replyCommentGQLVliadation } from "./comment.validation";
// GQL Validation
export type getAllCommentsGQLDTO = z.infer<typeof getAllCommentsGQLValidation>
export type getCommentGQLDTO = z.infer<typeof getCommentGQLValidation>
export type createCommentGQLDTO = z.infer<typeof creatCommentGQLValidation>
export type replyCommentGQLDTO = z.infer<typeof replyCommentGQLVliadation>