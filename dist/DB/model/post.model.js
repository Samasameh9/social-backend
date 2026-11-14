"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
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
    likes: { type: mongoose_1.default.Types.ObjectId, ref: "user" },
    commentsCount: {
        type: Number,
        default: 0,
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
exports.PostModel = mongoose_1.default.models.post || mongoose_1.default.model("post", postSchema);
