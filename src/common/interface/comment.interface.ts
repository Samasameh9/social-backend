import mongoose from "mongoose";

export interface IComment {
  createdBy: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content?: string;
  attachments?: string[];
  likes? : mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId| null;
  isDeleted?: boolean;
  createdAt?:Date;
  updatedAt?:Date;
}
