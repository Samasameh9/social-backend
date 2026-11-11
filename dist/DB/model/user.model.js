"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../../common/enum/user.enum");
const hash_security_js_1 = require("../../common/security/hash.security.js");
const encryption_security_js_1 = require("../../common/security/encryption.security.js");
const userSchema = new mongoose_1.default.Schema({
    status: {
        type: Number,
        enum: user_enum_1.AccountStatusEnum,
        default: user_enum_1.AccountStatusEnum.ACTIVE,
    },
    changeStatusAt: Date,
    firstName: { type: String, minLength: 3, maxLength: 15, required: true },
    lastName: { type: String, minLength: 3, maxLength: 15, required: true },
    email: { type: String, unique: true, required: true },
    password: {
        type: String,
        required: function () {
            return this.provider == user_enum_1.ProviderEnum.SYSTEM;
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
        enum: user_enum_1.GenderEnum,
        default: user_enum_1.GenderEnum.Male,
    },
    role: {
        type: Number,
        enum: user_enum_1.RoleEnum,
        default: user_enum_1.RoleEnum.USER,
    },
    provider: {
        type: Number,
        default: user_enum_1.ProviderEnum.SYSTEM,
        enum: user_enum_1.ProviderEnum,
    },
    privacy: {
        type: Number,
        default: user_enum_1.PrivacyEnum.PUBLIC,
        enum: user_enum_1.PrivacyEnum,
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
userSchema.pre("validate", function () {
    if (this.provider == user_enum_1.ProviderEnum.GOOGLE && this.password) {
        throw new Error("Google account cannot hold password");
    }
});
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await (0, hash_security_js_1.hash)({ plaintext: this.password });
    }
    if (this.isModified("phone")) {
        this.phone = await (0, encryption_security_js_1.encryption)(this.phone);
    }
});
userSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getFilter();
    if (query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.AccountStatusEnum.ARCHIVE } });
    }
});
userSchema.pre(["updateOne", "findOneAndUpdate", "updateMany"], function () {
    const query = this.getFilter();
    const update = this.getUpdate();
    if (update.status == user_enum_1.AccountStatusEnum.ACTIVE) {
        this.setQuery({ ...query, status: { $eq: user_enum_1.AccountStatusEnum.ARCHIVE } });
    }
    else if (update.status == user_enum_1.AccountStatusEnum.ARCHIVE) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.AccountStatusEnum.ARCHIVE } });
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.AccountStatusEnum.ARCHIVE } });
    }
    this.setUpdate({
        ...this.getUpdate(),
        ...(update.status ? { changeStatusAt: new Date() } : {}),
    });
});
userSchema.pre(["deleteMany", "deleteOne", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: user_enum_1.AccountStatusEnum.ARCHIVE } });
    }
});
exports.UserModel = mongoose_1.default.models.user || mongoose_1.default.model("user", userSchema);
