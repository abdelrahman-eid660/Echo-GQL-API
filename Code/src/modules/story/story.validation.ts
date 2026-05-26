import z from "zod";
import { availabilityEnum } from "../../common/enum";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/validation";

export const createStoryGQL = z.strictObject({
      content: z.string().optional(),
      attachments: z
        .object({ image: z.array(z.any()), video: z.array(z.any()) })
        .optional(),
      tags: z.array(z.string()).optional(),
      mentions: z.array(z.string()).optional(),
      availability: z.coerce.number().default(availabilityEnum.PUBLIC)})
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
})

export const updateStoryGQL = z.strictObject({
      storyId: generalValidationFields.id,
      mentions: z.array(z.string()).optional(),
      availability: z.coerce.number().default(availabilityEnum.PUBLIC),
    }
)
export const getStoriesGQL = z.strictObject({
    cursor: generalValidationFields.id.optional(),
    limit: z.coerce.number().optional(),
})
export const watchStoryGQL = z.strictObject({
    storyId: generalValidationFields.id,
})
export const getUserStoriesGQL = z.strictObject({
    userId: generalValidationFields.id,
})
export const getViewerAndReactsStoriesGQL = z.strictObject({
    userId: generalValidationFields.id,
    storyId: generalValidationFields.id,
})
export const deleteStoryGQL = z.strictObject({
    storyId: generalValidationFields.id,
})
