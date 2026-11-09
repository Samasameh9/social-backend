"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFileds = void 0;
const zod_1 = require("zod");
const security_enum_1 = require("../enum/security.enum");
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../enum/user.enum.js");
const matchFields = ({ original, copy, data, ctx, lang }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang == security_enum_1.LanguageEnum.AR
                ? `لا توافق بين ${original}و ${copy}`
                : `${original} mismatch with ${copy}`,
        });
    }
};
exports.generalValidationFileds = {
    email: (lang) => zod_1.z.email({
        message: lang == security_enum_1.LanguageEnum.AR
            ? "ادخال البريد الاكتروني غير صحيح"
            : "invalid email format",
    }),
    password: (lang) => zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\s{0,})(?=.*[!@#$%^&*()_]).{8,16}$/),
    username: (lang) => zod_1.z
        .string()
        .min(2, {
        message: lang == security_enum_1.LanguageEnum.AR
            ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين"
            : "minimum length of username is 2",
    })
        .max(30, {
        message: lang == security_enum_1.LanguageEnum.AR
            ? "عفوا الحد الاقصي لاسم المستخدم ثلاثين حرف"
            : "maximum length of username is 30",
    }),
    phone: (lang) => zod_1.z.e164(),
    matchFields,
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, { error: "invalid code" }),
    gender: (lang) => zod_1.z.union([zod_1.z.literal(user_enum_js_1.GenderEnum.Male), zod_1.z.literal(user_enum_js_1.GenderEnum.Female)]),
    id: (lang) => zod_1.z.string().refine((data) => {
        return mongoose_1.default.Types.ObjectId.isValid(data);
    }, { message: "invalid format" }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string(),
    }),
};
