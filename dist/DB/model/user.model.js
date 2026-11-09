"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, minLength: 3, maxLength: 15, required: true },
    lastName: { type: String, minLength: 3, maxLength: 15, required: true },
    email: { type: String, unique: true, required: true },
    password: {
        type: String,
        required: function () {
            return this.provider == user_enum_js_1.ProviderEnum.SYSTEM;
        },
    },
    DOB: { type: Date },
    image: String,
    coverImage: [String],
    confirmEmail: { type: Date },
    phone: String,
    changeCredentialsTime: Date,
    twoStepVerification: { type: Boolean, default: false },
    gender: {
        type: Number,
        enum: user_enum_js_1.GenderEnum,
        default: user_enum_js_1.GenderEnum.Male,
    },
    role: {
        type: Number,
        enum: user_enum_js_1.RoleEnum,
        default: user_enum_js_1.RoleEnum.USER,
    },
    provider: {
        type: Number,
        default: user_enum_js_1.ProviderEnum.SYSTEM,
        enum: user_enum_js_1.ProviderEnum,
    },
    privacy: {
        type: Number,
        default: user_enum_js_1.PrivacyEnum.PUBLIC,
        enum: user_enum_js_1.PrivacyEnum,
    },
    followers: [String],
    following: [String],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
userSchema
    .virtual("username")
    .set(function (values) {
    const [firstName, lastName] = values?.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
exports.UserModel = mongoose_1.default.models.user || mongoose_1.default.model("user", userSchema);
