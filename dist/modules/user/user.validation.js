"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersSchema = exports.suggestionsUsersSchema = exports.cancelFollowRequest = exports.followUnfollowSchema = exports.followRequestValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_js_1 = require("../../common/utilis/validation.js");
const followRequestValidation = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.object({
            receiverId: validation_js_1.generalValidationFields.id(lang),
            note: zod_1.default.string().optional(),
        }),
    });
};
exports.followRequestValidation = followRequestValidation;
const followUnfollowSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.object({
            userId: validation_js_1.generalValidationFields.id(lang),
            action: zod_1.default.union([zod_1.default.literal(0), zod_1.default.literal(1)]),
        }),
        params: zod_1.default.object({
            followRequestId: validation_js_1.generalValidationFields.id(lang),
        }),
    });
};
exports.followUnfollowSchema = followUnfollowSchema;
const cancelFollowRequest = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.object({
            userId: validation_js_1.generalValidationFields.id(lang),
        }),
        params: zod_1.default.object({
            followRequestId: validation_js_1.generalValidationFields.id(lang),
        }),
    });
};
exports.cancelFollowRequest = cancelFollowRequest;
const paginationSchema = zod_1.default.object({
    page: zod_1.default.coerce.number().int().min(1).default(1),
    limit: zod_1.default.coerce.number().int().min(1).max(50).default(10),
});
const suggestionsUsersSchema = (lang) => {
    return zod_1.default.object({
        query: paginationSchema,
    });
};
exports.suggestionsUsersSchema = suggestionsUsersSchema;
const searchUsersSchema = (lang) => {
    return zod_1.default.object({
        query: paginationSchema.extend({
            keyword: zod_1.default.string().trim().min(1),
        }),
    });
};
exports.searchUsersSchema = searchUsersSchema;
