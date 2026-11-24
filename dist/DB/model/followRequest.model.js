"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowRequestModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const followRequest_enum_js_1 = require("../../common/enum/followRequest.enum.js");
const followRequestSchema = new mongoose_1.default.Schema({
    senderId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    receiverId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    note: { type: String, minLength: 5, maxLength: 5000 },
    status: {
        type: Number,
        default: followRequest_enum_js_1.FollowRequestStatusEnum.PENDING,
        enum: followRequest_enum_js_1.FollowRequestStatusEnum,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
exports.FollowRequestModel = mongoose_1.default.models.FollowRequest ||
    mongoose_1.default.model("FollowRequest", followRequestSchema);
