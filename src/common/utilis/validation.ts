import { z } from "zod";
import { LanguageEnum } from "../enum/security.enum";
import mongoose from "mongoose";
import { GenderEnum } from "../enum/user.enum.js";



const matchFields = ({ original, copy, data, ctx, lang }:{ original:string, copy:string, data:any, ctx:any, lang:LanguageEnum }) => {
  if (data[original] != data[copy]) {
    ctx.addIssue({
      code: "custom",
      path: [copy],
      message:
        lang == LanguageEnum.AR
          ? `لا توافق بين ${original}و ${copy}`
          : `${original} mismatch with ${copy}`,
    });
  }
};

export const generalValidationFileds = {
  email: (lang:LanguageEnum) =>
    z.email({
      message:
        lang == LanguageEnum.AR
          ? "ادخال البريد الاكتروني غير صحيح"
          : "invalid email format",
    }),
  password: (lang:LanguageEnum) =>
    z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\s{0,})(?=.*[!@#$%^&*()_]).{8,16}$/,
      ),
  username: (lang:LanguageEnum) =>
    z
      .string()
      .min(2, {
        message:
          lang == LanguageEnum.AR
            ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين"
            : "minimum length of username is 2",
      })
      .max(30, {
        message:
          lang == LanguageEnum.AR
            ? "عفوا الحد الاقصي لاسم المستخدم ثلاثين حرف"
            : "maximum length of username is 30",
      }),
  phone: (lang:LanguageEnum) => z.e164(),
  matchFields,
  otp: (lang:LanguageEnum) => z.string().regex(/^\d{6}$/, { error: "invalid code" }),
  gender: (lang:LanguageEnum) =>
    z.union([z.literal(GenderEnum.Male), z.literal(GenderEnum.Female)]),
  id: (lang:LanguageEnum) =>
    z.string().refine(
      (data) => {
        return mongoose.Types.ObjectId.isValid(data);
      },
      { message: "invalid format" },
    ),
  file: (lang:LanguageEnum) =>
    z.strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
      size: z.number(),
      path: z.string(),
    }),
};
