import mongoose from "mongoose";
import { FollowRequestStatusEnum } from "../enum/followRequest.enum.js";

export interface IFollowRequest {
  createdAt?: Date;
  updatedAt?: Date;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  note?: string;
  status:FollowRequestStatusEnum
}
