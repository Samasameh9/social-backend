import mongoose from "mongoose";
import { NotificationTypeEnum } from "../enum/notifaction.enum.js";

export interface INotification{
        recipient_id:  mongoose.Types.ObjectId;
        sender_id: mongoose.Types.ObjectId;
        type:NotificationTypeEnum;
        is_read: boolean;
        
}