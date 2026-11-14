"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    createdBy: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    postId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "post",
        required: true,
    },
    content: {
        type: String,
        minLength: 3,
        maxLength: 5000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: { type: [String] },
    likes: { type: mongoose_1.default.Types.ObjectId, ref: "user" },
    parentComment: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "comment",
        default: null,
    },
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
exports.CommentModel = mongoose_1.default.models.comment || mongoose_1.default.model("comment", commentSchema);
