import mongoose, { HydratedDocument } from "mongoose";
import { IPost, IReaction } from "../../common/interface/post.interface.js";
import { PrivacyPostEnum, ReactionEnum } from "../../common/enum/post.enum.js";
const reactionSchema = new mongoose.Schema<IReaction>(
  {
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    reaction: [
      { type: Number, enum: ReactionEnum, default: ReactionEnum.LIKE },
    ],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

const postSchema = new mongoose.Schema<IPost>(
  {
    folderId:{type:Number,required:true},
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    content: {
      type: String,
      minLength: 3,
      maxLength: 5000,
      required: function (this): boolean {
        return !this.attachments?.length;
      },
    },
    attachments: { type: [String] },
    reaction: reactionSchema,
    commentsCount: {
      type: Number,
      default: 0,
    },
    mentions: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    privacy: {
      type: Number,
      enum: PrivacyPostEnum,
      default: PrivacyPostEnum.PUBLIC,
    },
    sharedBy: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    allowShare: Boolean,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

export const PostModel =
  mongoose.models.post || mongoose.model<IPost>("post", postSchema);
export type HPost = HydratedDocument<IPost>;
