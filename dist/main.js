"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./modules/index");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const config_js_1 = require("./config.js");
const connection_db_js_1 = require("./DB/connection.db.js");
const cors_1 = __importDefault(require("cors"));
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const s3ResponsePipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const cloud_service_js_1 = require("./common/service/cloud.service.js");
const notification_service_js_1 = require("./common/service/notification.service.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)(), express_1.default.json());
app.use("/assets", express_1.default.static("./assets"));
(0, connection_db_js_1.bootstrapDB)(app, config_js_1.port);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "done" });
});
app.get("/uploads/presigned/*path", async (req, res, next) => {
    const Key = req.params.path.join("/");
    const { download = "false", filename = req.params.path.pop(), } = req.query;
    const url = await cloud_service_js_1.cloudService.createPreSignedFetchAssetLink({
        Key,
        download,
        filename,
    });
    return res.status(200).json({ message: "done", url });
});
app.get("/uploads/*path", async (req, res, next) => {
    const Key = req.params.path.join("/");
    const { download = "false", filename = req.params.path.pop(), } = req.query;
    const { Body } = await cloud_service_js_1.cloudService.getAsset({ Key });
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if (download == "true") {
        res.setHeader("content-Disposition", `attachment;filename"${filename}"`);
    }
    return await s3ResponsePipe(Body, res);
});
app.post("/send-notification", async (req, res, next) => {
    const token = req.body.token;
    await notification_service_js_1.notificationService.sendNotification({
        token,
        notification: { title: "hello", body: "lorem" },
    });
    return res.status(200).json({ message: "done" });
});
app.use("/auth", index_1.authenticationController);
app.use("/user", index_1.userController);
app.use("/post", index_1.postController);
app.use("/comment", index_1.commentController);
app.use("/notification", index_1.notificationController);
app.use(error_middleware_js_1.globalErrorHandling);
