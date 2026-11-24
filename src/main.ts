import express from "express";
import {
  authenticationController,
  userController,
  postController,
  commentController,
  notificationController,
} from "./modules/index";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { port } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import cors from "cors";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
const s3ResponsePipe = promisify(pipeline);
import { cloudService } from "./common/service/cloud.service.js";
import { notificationService } from "./common/service/notification.service.js";

const app: express.Application = express();

app.use(cors(), express.json());
app.use("/assets", express.static("./assets"));

bootstrapDB(app, port);

app.all(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response> => {
    return res.status(200).json({ message: "done" });
  },
);
app.get(
  "/uploads/presigned/*path",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const Key = (req.params.path as string[]).join("/");
    const {
      download = "false",
      filename = (req.params.path as string[]).pop(),
    } = req.query as { download?: "true" | "false"; filename?: string };
    const url = await cloudService.createPreSignedFetchAssetLink({
      Key,
      download,
      filename,
    });

    return res.status(200).json({ message: "done", url });
  },
);
app.get(
  "/uploads/*path",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const Key = (req.params.path as string[]).join("/");
    const {
      download = "false",
      filename = (req.params.path as string[]).pop(),
    } = req.query as { download?: "true" | "false"; filename?: string };
    const { Body } = await cloudService.getAsset({ Key });
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if (download == "true") {
      res.setHeader("content-Disposition", `attachment;filename"${filename}"`);
    }
    return await s3ResponsePipe(Body as NodeJS.ReadableStream, res);
  },
);
app.post(
  "/send-notification",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response> => {
    const token = req.body.token;
    await notificationService.sendNotification({
      token,
      notification: { title: "hello", body: "lorem" },
    });
    return res.status(200).json({ message: "done" });
  },
);

app.use("/auth", authenticationController);
app.use("/user", userController);
app.use("/post", postController);
app.use("/comment", commentController);
app.use("/notification", notificationController);


app.use(globalErrorHandling);
