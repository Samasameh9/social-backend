import { App, cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cachService, CachService } from "./cashe.service.js";
import mongoose from "mongoose";
type UserIdType = mongoose.Types.ObjectId | string;
export class NotificationService {
  private client: App;
  private cachService: CachService;
  constructor() {
    this.cachService = cachService;
    this.client = initializeApp({
      credential: cert(
        JSON.parse(
          readFileSync(
            resolve(
              "./src/config/socialapp00-firebase-adminsdk-fbsvc-35387d08dc.json",
            ),
          ) as unknown as string,
        ),
      ),
    });
  }
  Key({ userId }: { userId: string | UserIdType }) {
    return `user:FCM:${userId.toString()}`;
  }
  async addFCM({ userId, FCM }: { userId: UserIdType; FCM: string }) {
    return await this.cachService.addFCM({
      key: this.Key({ userId }),
      value: FCM,
    });
  }
  async removeFCM({ userId, FCM }: { userId: UserIdType; FCM: string }) {
    return await this.cachService.removeFCM({
      key: this.Key({ userId }),
      value: FCM,
    });
  }
  async getFCMs({ userId }: { userId: UserIdType }) {
    return await this.cachService.getFCMs({ key: this.Key({ userId }) });
  }
  async hasFCMs({ userId }: { userId: UserIdType }) {
    return await this.cachService.hasFCMs({ key: this.Key({ userId }) });
  }
  async sendNotification({
    token,
    notification,
  }: {
    token: string;
    notification: { title: string; body: string; imageUrl?: string };
  }) {
    return await getMessaging(this.client).send({
      token,
      notification,
    });
  }
    async sendNotifications({
    tokens,
    notification,
  }: {
    tokens: string[];
    notification: { title: string; body: string; imageUrl?: string };
  }) {
    return await Promise.allSettled(tokens.map(token=> this.sendNotification({token,notification})))
   
  }
}
export const notificationService = new NotificationService();
