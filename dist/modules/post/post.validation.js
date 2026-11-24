"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.posIdValidation = exports.update = exports.createPost = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_js_1 = require("../../common/utilis/validation.js");
const post_enum_js_1 = require("../../common/enum/post.enum.js");
const createPost = (lang) => {
    return zod_1.default
        .object({
        body: zod_1.default.strictObject({
            content: zod_1.default.string().trim().min(3).max(5000).optional(),
            mentions: zod_1.default
                .array(validation_js_1.generalValidationFields.id(lang))
                .min(1)
                .max(5)
                .optional(),
            allowShare: zod_1.default.coerce.boolean().default(true),
            privacy: zod_1.default.coerce.number().default(post_enum_js_1.PrivacyPostEnum.PUBLIC),
        }),
        files: zod_1.default.array(validation_js_1.generalValidationFields.file(lang).optional()).optional(),
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
        if (!Object.values(post_enum_js_1.PrivacyPostEnum).includes(data.body.privacy)) {
            ctx.addIssue({
                code: "custom",
                path: ["privacy"],
                message: "invalid privacy",
            });
        }
    });
};
exports.createPost = createPost;
const update = (lang) => {
    return zod_1.default
        .object({
        params: zod_1.default.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        }),
        body: zod_1.default.strictObject({
            content: zod_1.default.string().trim().min(3).max(5000).optional(),
            mentions: zod_1.default
                .array(validation_js_1.generalValidationFields.id(lang))
                .min(1)
                .max(5)
                .optional(),
            removeMention: zod_1.default
                .array(validation_js_1.generalValidationFields.id(lang))
                .min(1)
                .optional(),
            removeAttachments: zod_1.default.array(zod_1.default.string()).min(1).optional(),
            allowShare: zod_1.default.coerce.boolean().default(true),
            privacy: zod_1.default.coerce.number().default(post_enum_js_1.PrivacyPostEnum.PUBLIC).optional(),
        }),
        files: zod_1.default.array(validation_js_1.generalValidationFields.file(lang).optional()).optional(),
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
exports.update = update;
const posIdValidation = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        }),
    });
};
exports.posIdValidation = posIdValidation;
