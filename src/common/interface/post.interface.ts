import mongoose from "mongoose";
import { ReactionEnum,PrivacyPostEnum } from "../enum/post.enum.js";


export interface IReaction {
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  reaction:ReactionEnum
}


export interface IPost {
  folderId:number;
  createdBy: mongoose.Types.ObjectId;
  content?: string;
  attachments?: string[];
  reaction?: IReaction[];
  mentions?:mongoose.Types.ObjectId[];
  privacy: PrivacyPostEnum;
  sharedBy?:mongoose.Types.ObjectId[];
  allowShare:boolean;
  commentsCount?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
