"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const firebase_admin_1 = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const cashe_service_js_1 = require("./cashe.service.js");
class NotificationService {
    client;
    cachService;
    constructor() {
        this.cachService = cashe_service_js_1.cachService;
        this.client = (0, firebase_admin_1.initializeApp)({
            credential: (0, firebase_admin_1.cert)(JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)("./src/config/socialapp00-firebase-adminsdk-fbsvc-35387d08dc.json")))),
        });
    }
    Key({ userId }) {
        return `user:FCM:${userId.toString()}`;
    }
    async addFCM({ userId, FCM }) {
        return await this.cachService.addFCM({
            key: this.Key({ userId }),
            value: FCM,
        });
    }
    async removeFCM({ userId, FCM }) {
        return await this.cachService.removeFCM({
            key: this.Key({ userId }),
            value: FCM,
        });
    }
    async getFCMs({ userId }) {
        return await this.cachService.getFCMs({ key: this.Key({ userId }) });
    }
    async hasFCMs({ userId }) {
        return await this.cachService.hasFCMs({ key: this.Key({ userId }) });
    }
    async sendNotification({ token, notification, }) {
        return await (0, messaging_1.getMessaging)(this.client).send({
            token,
            notification,
        });
    }
    async sendNotifications({ tokens, notification, }) {
        return await Promise.allSettled(tokens.map(token => this.sendNotification({ token, notification })));
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
