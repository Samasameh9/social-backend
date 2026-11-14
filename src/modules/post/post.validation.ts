import z from "zod";
import { LanguageEnum } from "../../common/enum/security.enum.js";
import { generalValidationFileds } from "../../common/utilis/validation.js";

export const createPost = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      content: z.string().trim().min(3).max(5000).optional(),
    }),
   
  });
};
export const update = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      postId: generalValidationFileds.id(lang),
    }),
    body: createPost(lang).shape.body,
  });
};

export const posIdValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      postId: generalValidationFileds.id(lang),
    }),
  });
};
