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
const app = (0, express_1.default)();
app.use((0, cors_1.default)(), express_1.default.json());
app.use("/assets", express_1.default.static("./assets"));
(0, connection_db_js_1.bootstrapDB)(app, config_js_1.port);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "done" });
});
app.use("/auth", index_1.authenticationController);
app.use("/user", index_1.userController);
app.use(error_middleware_js_1.globalErrorHandling);
