"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notifaction_enum_js_1 = require("../../common/enum/notifaction.enum.js");
const notificationSchema = new mongoose_1.default.Schema({
    recipient_id: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
        ref: "user",
    },
    sender_id: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "user" },
    type: {
        type: String,
        enum: Object.values(notifaction_enum_js_1.NotificationTypeEnum),
        required: true,
        default: notifaction_enum_js_1.NotificationTypeEnum.MESSAGE
    },
    is_read: {
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
exports.NotificationModel = mongoose_1.default.models.notification ||
    mongoose_1.default.model("notification", notificationSchema);
