import z from "zod";
import { LanguageEnum } from "../../common/enum/security.enum.js";
import { generalValidationFields } from "../../common/utilis/validation.js";


export const followRequestValidation = (lang: LanguageEnum) => {
  return z.object({
    body: z.object({
      receiverId: generalValidationFields.id(lang),
      note: z.string().optional(),
    }),
  });
};

export const followUnfollowSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.object({
      userId: generalValidationFields.id(lang),
      action: z.union([z.literal(0), z.literal(1)]),
    }),
      params: z.object({
      followRequestId: generalValidationFields.id(lang),
    }),
  });
};

export const cancelFollowRequest = (lang: LanguageEnum) => {
  return z.object({
    body: z.object({
      userId: generalValidationFields.id(lang),
    }),
      params: z.object({
      followRequestId: generalValidationFields.id(lang),
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
