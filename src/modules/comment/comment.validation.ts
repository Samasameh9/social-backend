import z from "zod";
import { LanguageEnum } from "../../common/enum/security.enum.js";
import { generalValidationFields } from "../../common/utilis/validation.js";

export const createCommentValidation = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      content: z.string().trim().min(3).max(5000).optional(),
    }),
    params: z.strictObject({
      postId: generalValidationFields.id(lang),
    }),
  });
};
