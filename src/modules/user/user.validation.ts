import z from "zod";
import { LanguageEnum } from "../../common/enum/security.enum.js";
import { generalValidationFileds } from "../../common/utilis/validation.js";

export const followUnfollowSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.object({
      userId: generalValidationFileds.id(lang),
      action: z.union([z.literal(0), z.literal(1)]),
    }),
  });
};

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const suggestionsUsersSchema = (lang: LanguageEnum) => {
  return z.object({
    query: paginationSchema,
  });
};

export const searchUsersSchema = (lang: LanguageEnum) => {
  return z.object({
    query: paginationSchema.extend({
      keyword: z.string().trim().min(1),
    }),
  });
};
