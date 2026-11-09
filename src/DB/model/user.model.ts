import mongoose, { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interface/user.interface.js";
import {
  GenderEnum,
  PrivacyEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/user.enum.js";
const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, minLength: 3, maxLength: 15, required: true },
    lastName: { type: String, minLength: 3, maxLength: 15, required: true },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: function (): boolean {
        return this.provider == ProviderEnum.SYSTEM;
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
      enum: GenderEnum,
      default: GenderEnum.Male,
    },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      default: ProviderEnum.SYSTEM,
      enum: ProviderEnum,
    },
    privacy: {
      type: Number,
      default: PrivacyEnum.PUBLIC,
      enum: PrivacyEnum,
    },
    followers:[String],
    following:[String],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

userSchema
  .virtual("username")
  .set(function (values) {
    const [firstName, lastName] = values?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

export const UserModel =
  mongoose.models.user || mongoose.model<IUser>("user", userSchema);
export type HUser = HydratedDocument<IUser>;
