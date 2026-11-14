import mongoose, { HydratedDocument } from "mongoose";
import { IPost } from "../../common/interface/post.interface.js";
const postSchema = new mongoose.Schema<IPost>(
  {
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    content: {
      type: String,
      minLength: 3,
      maxLength: 5000,
      required: function ():boolean {
        return !this.attachments?.length
      },
    },
    attachments: { type: [String] },
    likes: { type: mongoose.Types.ObjectId, ref: "user" },
    commentsCount: {
      type: Number,
      default: 0,
    },

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
