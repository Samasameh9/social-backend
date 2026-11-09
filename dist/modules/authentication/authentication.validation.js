"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgotPasswordValidation = exports.confirmEmailValidation = exports.resendConfirmEmailValidation = exports.signup = exports.login = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/utilis/validation");
const loginSchema = (lang) => {
    return zod_1.z.object({
        email: validation_1.generalValidationFileds.email(lang),
        password: validation_1.generalValidationFileds.password(lang),
    });
};
exports.loginSchema = loginSchema;
const login = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang),
        query: zod_1.z.strictObject({
            darkMood: zod_1.z.stringbool().optional(),
        }),
    });
};
exports.login = login;
const signup = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang)
            .safeExtend({
            username: validation_1.generalValidationFileds.username(lang),
            confirmPassword: validation_1.generalValidationFileds.password(lang),
            phone: validation_1.generalValidationFileds.phone(lang),
            gender: validation_1.generalValidationFileds.gender(lang),
        })
            .superRefine((data, ctx) => {
            validation_1.generalValidationFileds.matchFields({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang,
            });
        }),
    });
};
exports.signup = signup;
const resendConfirmEmailValidation = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFileds.email(lang),
        }),
    });
};
exports.resendConfirmEmailValidation = resendConfirmEmailValidation;
const confirmEmailValidation = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFileds.email(lang),
            otp: validation_1.generalValidationFileds.otp(lang),
        }),
    });
};
exports.confirmEmailValidation = confirmEmailValidation;
const resetForgotPasswordValidation = (lang) => {
    return zod_1.z.object({
        body: zod_1.z
            .strictObject({
            email: validation_1.generalValidationFileds.email(lang),
            otp: validation_1.generalValidationFileds.otp(lang),
            password: validation_1.generalValidationFileds.password(lang),
            confirmPassword: validation_1.generalValidationFileds.password(lang),
        })
            .superRefine((data, ctx) => {
            validation_1.generalValidationFileds.matchFields({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang,
            });
        }),
    });
};
exports.resetForgotPasswordValidation = resetForgotPasswordValidation;
