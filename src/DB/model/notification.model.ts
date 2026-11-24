import mongoose, { HydratedDocument } from "mongoose";
import { INotification } from "../../common/interface/notification.interface.js";
import { NotificationTypeEnum } from "../../common/enum/notifaction.enum.js";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    recipient_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "user",
    },
    sender_id: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    type: {
      type: String,
      enum: Object.values(NotificationTypeEnum),
      required: true,
      default:NotificationTypeEnum.MESSAGE
    },
    is_read: {
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

export const NotificationModel =
  mongoose.models.notification ||
  mongoose.model<INotification>("notification", notificationSchema);
export type HNotification = HydratedDocument<INotification>;
