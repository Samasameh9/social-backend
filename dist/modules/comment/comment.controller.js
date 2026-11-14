"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const local_multer_js_1 = require("../../common/utilis/multer/local.multer.js");
const multer_enum_js_1 = require("../../common/enum/multer.enum.js");
const multer_middleware_js_1 = require("../../middleware/multer.middleware.js");
const response_middleware_js_1 = require("../../middleware/response.middleware.js");
const comment_service_js_1 = __importDefault(require("./comment.service.js"));
const validators = __importStar(require("./comment.validation"));
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/:postId", (0, authentication_middleware_js_1.authentication)(), (0, multer_middleware_js_1.uploadMiddleware)({
    multerMiddleware: (0, local_multer_js_1.localFileUpload)({
        storageApproach: multer_enum_js_1.StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: local_multer_js_1.FileValidation.image,
    customPath: "Comment",
}), (0, validation_middleware_js_1.validation)(validators.createCommentValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const { content } = req.validate.body;
    const data = await comment_service_js_1.default.createComment(req.user, req.params.postId, {
        content,
        files: req.files,
    });
    return { status: 201, data };
}));
router.get("/all-comments-on-post/:postId", (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await comment_service_js_1.default.getAllCommentsOnPost(req.user, req.params.postId, { page, limit });
    return { status: 200, data };
}));
router.get("/:commentId", (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_js_1.default.getSinglePost(req.params.commentId);
    return { status: 200, data };
}));
router.patch("/:commentId", (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_js_1.default.update(req.user, req.body, req.params.commentId);
    return { res, data };
}));
router.delete("/:commentId", (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_js_1.default.delete(req.params.commentId, req.user);
    return { res, data };
}));
exports.default = router;
