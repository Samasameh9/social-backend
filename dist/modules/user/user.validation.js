"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersSchema = exports.suggestionsUsersSchema = exports.followUnfollowSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_js_1 = require("../../common/utilis/validation.js");
const followUnfollowSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.object({
            userId: validation_js_1.generalValidationFileds.id(lang),
            action: zod_1.default.union([zod_1.default.literal(0), zod_1.default.literal(1)]),
        }),
    });
};
exports.followUnfollowSchema = followUnfollowSchema;
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
