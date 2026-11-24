import z from "zod";
import { LanguageEnum } from "../../common/enum/security.enum.js";
import { generalValidationFields } from "../../common/utilis/validation.js";
import { PrivacyPostEnum } from "../../common/enum/post.enum.js";

export const createPost = (lang: LanguageEnum) => {
  return z
    .object({
      body: z.strictObject({
        content: z.string().trim().min(3).max(5000).optional(),
        mentions: z
          .array(generalValidationFields.id(lang))
          .min(1)
          .max(5)
          .optional(),
        allowShare: z.coerce.boolean().default(true),
        privacy: z.coerce.number().default(PrivacyPostEnum.PUBLIC),
      }),
      files: z.array(generalValidationFields.file(lang).optional()).optional(),
    })
    .superRefine((data, ctx) => {
      console.log(data);
      if (!data.body?.content?.length && !data.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Content is required",
        });
      }
      if (data.body?.mentions?.length) {
        data.body.mentions = [...new Set(data.body.mentions)];
      }
      if (!Object.values(PrivacyPostEnum).includes(data.body.privacy)) {
        ctx.addIssue({
          code: "custom",
          path: ["privacy"],
          message: "invalid privacy",
        });
      }
    });
};
export const update = (lang: LanguageEnum) => {
  return z
    .object({
      params: z.strictObject({
        postId: generalValidationFields.id(lang),
      }),
      body: z.strictObject({
        content: z.string().trim().min(3).max(5000).optional(),
        mentions: z
          .array(generalValidationFields.id(lang))
          .min(1)
          .max(5)
          .optional(),
        removeMention: z
          .array(generalValidationFields.id(lang))
          .min(1)
          .optional(),
        removeAttachments: z.array(z.string()).min(1).optional(),
        allowShare: z.coerce.boolean().default(true),
        privacy: z.coerce.number().default(PrivacyPostEnum.PUBLIC).optional(),
      }),
      files: z.array(generalValidationFields.file(lang).optional()).optional(),
    })
    .superRefine((data, ctx) => {
      console.log(data);

      if (data.body?.mentions?.length) {
        data.body.mentions = [...new Set(data.body.mentions)];
      }
      if (data.body?.removeMention?.length) {
        data.body.removeMention = [...new Set(data.body.removeMention)];
      }
      if (data.body?.removeAttachments?.length) {
        data.body.removeAttachments = [...new Set(data.body.removeAttachments)];
      }
    });
};

export const posIdValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      postId: generalValidationFields.id(lang),
    }),
  });
};
