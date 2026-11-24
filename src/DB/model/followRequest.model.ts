import mongoose, { HydratedDocument } from "mongoose";
import { IFollowRequest } from "../../common/interface/followRequest.interface.js";
import { FollowRequestStatusEnum } from "../../common/enum/followRequest.enum.js";
const followRequestSchema = new mongoose.Schema<IFollowRequest>(
  {
    senderId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    receiverId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    note: { type: String, minLength: 5, maxLength: 5000 },
    status: {
      type: Number,
      default: FollowRequestStatusEnum.PENDING,
      enum: FollowRequestStatusEnum,
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

export const FollowRequestModel =
  mongoose.models.FollowRequest ||
  mongoose.model<IFollowRequest>("FollowRequest", followRequestSchema);
export type HFollowRequest = HydratedDocument<IFollowRequest>;
