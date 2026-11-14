import mongoose, { HydratedDocument } from "mongoose";
import { IComment } from "../../common/interface/comment.interface.js";
const commentSchema = new mongoose.Schema<IComment>(
  {
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "post",
      required: true,
    },
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
    parentComment: {
      type: mongoose.Types.ObjectId,
      ref: "comment",
      default: null,
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

export const CommentModel =
  mongoose.models.comment || mongoose.model<IComment>("comment", commentSchema);
export type HComment = HydratedDocument<IComment>;
