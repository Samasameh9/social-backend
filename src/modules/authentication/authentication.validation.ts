import { z } from "zod";
import { LanguageEnum } from "../../common/enum/security.enum";
import { generalValidationFields } from "../../common/utilis/validation";


export const loginSchema = (lang:LanguageEnum) => {
  return z.object({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
    FCM:z.string().optional()
  });
};
export const login = (lang:LanguageEnum) => {
  return z.object({
    body: loginSchema(lang),
    query: z.strictObject({
      darkMood: z.stringbool().optional(),
    }),
  });
};
export const signup = (lang:LanguageEnum) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        username: generalValidationFields.username(lang),
        confirmPassword: generalValidationFields.password(lang),
        phone: generalValidationFields.phone(lang),
        gender: generalValidationFields.gender(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};

export const resendConfirmEmailValidation = (lang:LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
  });
};

export const confirmEmailValidation = (lang:LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
  });
};

export const resetForgotPasswordValidation = (lang:LanguageEnum) => {
  return z.object({
    body: z
      .strictObject({
        email: generalValidationFields.email(lang),
        otp: generalValidationFields.otp(lang),
        password: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.password(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};
