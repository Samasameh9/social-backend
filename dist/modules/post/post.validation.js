"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.posIdValidation = exports.update = exports.createPost = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_js_1 = require("../../common/utilis/validation.js");
const createPost = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            content: zod_1.default.string().trim().min(3).max(5000).optional(),
        }),
    });
};
exports.createPost = createPost;
const update = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            postId: validation_js_1.generalValidationFileds.id(lang),
        }),
        body: (0, exports.createPost)(lang).shape.body,
    });
};
exports.update = update;
const posIdValidation = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            postId: validation_js_1.generalValidationFileds.id(lang),
        }),
    });
};
exports.posIdValidation = posIdValidation;
