import z from "zod";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/validation";
export const creatCommentGQLValidation = z
  .strictObject({
    commentId: generalValidationFields.id,
    postId: generalValidationFields.id,
    content: z.string().optional(),
    attachments: z
      .object({ image: z.array(z.string()), video: z.array(z.string()) })
      .optional(),
    mentions: z.array(z.string()).optional(),
  })
  .superRefine((args, ctx) => {
    if (!args.attachments && !args.content) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is Required",
      });
    }
    if (args.mentions?.length) {
      for (const arg of args?.mentions) {
        if (!Types.ObjectId.isValid(arg)) {
          ctx.addIssue({
            code: "custom",
            path: ["mentions"],
            message: `Invalid Tagged ObjectId ${arg}`,
          });
        }
      }
      const uniqueMentions = [...new Set(args.mentions)];
      if (uniqueMentions.length != args.mentions.length) {
        ctx.addIssue({
          code: "custom",
          path: ["mentions"],
          message: "Dublicated mentions",
        });
      }
    }
  });
export const replyCommentGQLVliadation = z
  .strictObject({
    commentId: generalValidationFields.id,
    postId: generalValidationFields.id,
    content: z.string().optional(),
    attachments: z
      .object({ image: z.array(z.string()), video: z.array(z.string()) })
      .optional(),
    mentions: z.array(generalValidationFields.id).optional(),
  })
  .superRefine((args, ctx) => {
    if (!args.attachments && !args.content) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is Required",
      });
    }
    if (args.mentions?.length) {
      for (const arg of args?.mentions) {
        if (!Types.ObjectId.isValid(arg)) {
          ctx.addIssue({
            code: "custom",
            path: ["mentions"],
            message: `Invalid Tagged ObjectId ${arg}`,
          });
        }
      }
      const uniqueMentions = [...new Set(args.mentions)];
      if (uniqueMentions.length != args.mentions.length) {
        ctx.addIssue({
          code: "custom",
          path: ["mentions"],
          message: "Dublicated mentions",
        });
      }
    }
  });
export const getAllCommentsGQLValidation = z.strictObject({
  limit: z.coerce.number().optional(),
  cursor: generalValidationFields.id.optional(),
  postId: generalValidationFields.id,
});
export const getCommentGQLValidation = z.strictObject({
  postId: generalValidationFields.id,
  commentId: generalValidationFields.id,
});
