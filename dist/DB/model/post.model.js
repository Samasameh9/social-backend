"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_enum_js_1 = require("../../common/enum/post.enum.js");
const reactionSchema = new mongoose_1.default.Schema({
    createdBy: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    reaction: [
        { type: Number, enum: post_enum_js_1.ReactionEnum, default: post_enum_js_1.ReactionEnum.LIKE },
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
const postSchema = new mongoose_1.default.Schema({
    folderId: { type: Number, required: true },
    createdBy: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    content: {
        type: String,
        minLength: 3,
        maxLength: 5000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: { type: [String] },
    reaction: reactionSchema,
    commentsCount: {
        type: Number,
        default: 0,
    },
    mentions: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
    privacy: {
        type: Number,
        enum: post_enum_js_1.PrivacyPostEnum,
        default: post_enum_js_1.PrivacyPostEnum.PUBLIC,
    },
    sharedBy: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
    allowShare: Boolean,
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
exports.PostModel = mongoose_1.default.models.post || mongoose_1.default.model("post", postSchema);
