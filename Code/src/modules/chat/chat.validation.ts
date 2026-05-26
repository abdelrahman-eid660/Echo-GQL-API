import z from "zod";
import { chatTypeEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/validation";
import { Types } from "mongoose";

export const sendMessageGQL = z.strictObject({
      chatId: generalValidationFields.id.optional(),
      chatType: z.enum(chatTypeEnum).default(chatTypeEnum.OVO),
      receiverId: generalValidationFields.id.optional(),
      content: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      mentions: z.array(generalValidationFields.id).optional(),
      replyTo: generalValidationFields.id.optional(),
    }).superRefine((args, ctx) => {
      if (!args.chatId && !args.receiverId) {
        ctx.addIssue({
          code: "custom",
          path: ["chatId", "receiverId"],
          message: "Either chatId or receiverId is required",
        });
      }
      if (!args.attachments && !args.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content", "attachments"],
          message: "at least send a content or attchment",
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
    })
export const createGroupGQL = z.strictObject({
    participants : z.array(generalValidationFields.id).min(2),
    chatType: z.enum(chatTypeEnum).default(chatTypeEnum.OVM),
    groupName: z.string(),
    groupImage: z.string().optional(),
    groupDescription: z.string().optional(),
    admins: z.array(generalValidationFields.id).min(1),
  })
export const getChatGQL = z.strictObject({
    limit : z.coerce.number().optional(),
    cursor : generalValidationFields.id.optional(),
    receiverId : generalValidationFields.id.optional(),
    chatId : generalValidationFields.id.optional(),
    chatType: z.string().optional()
}).superRefine((args, ctx) => {
      if (!args.chatId && !args.receiverId) {
        ctx.addIssue({
          code: "custom",
          path: ["chatId", "receiverId"],
          message: "Either chatId or receiverId is required",
        });
      }})
export const deleteMessageGQL = {
  params: z.strictObject({
    deletedFor: z.array(generalValidationFields.id),
  }),
};
export const getMessagesGQL = z.strictObject({
    chatType : z.enum(chatTypeEnum).default(chatTypeEnum.OVO),
    reciverId: generalValidationFields.id.optional(),
    chatId: generalValidationFields.id.optional(),
    }).superRefine((args, ctx) => {
      if (!args.chatId && !args.reciverId) {
        ctx.addIssue({
          code: "custom",
          path: ["chatId", "reciverId"],
          message: "Either chatId or reciverId is required",
        });
      }
      if (args.chatId && args.reciverId) {
        ctx.addIssue({
          code: "custom",
          path: ["chatId", "reciverId"],
          message: "Send only one of chatId or reciverId",
        });
      }
    })

export const addParticipantsGQL = z.strictObject({
  chatId : z.string(),
  participants : z.array(generalValidationFields.id).min(1),
})
export const removeOrPormotionOrLeaveParticipantGQL = z.strictObject({
  chatId : z.string(),
  userId : generalValidationFields.id,
})
export const typingStatusGQL = z.strictObject({
  chatId : z.string(),
  isTyping : z.boolean(),
})
