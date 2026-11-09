import { z } from "zod";
import { LanguageEnum } from "../../common/enum/security.enum";
import { generalValidationFileds } from "../../common/utilis/validation";


export const loginSchema = (lang:LanguageEnum) => {
  return z.object({
    email: generalValidationFileds.email(lang),
    password: generalValidationFileds.password(lang),
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
        username: generalValidationFileds.username(lang),
        confirmPassword: generalValidationFileds.password(lang),
        phone: generalValidationFileds.phone(lang),
        gender: generalValidationFileds.gender(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFileds.matchFields({
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
      email: generalValidationFileds.email(lang),
    }),
  });
};

export const confirmEmailValidation = (lang:LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFileds.email(lang),
      otp: generalValidationFileds.otp(lang),
    }),
  });
};

export const resetForgotPasswordValidation = (lang:LanguageEnum) => {
  return z.object({
    body: z
      .strictObject({
        email: generalValidationFileds.email(lang),
        otp: generalValidationFileds.otp(lang),
        password: generalValidationFileds.password(lang),
        confirmPassword: generalValidationFileds.password(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFileds.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};
