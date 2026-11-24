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
const response_middleware_js_1 = require("../../middleware/response.middleware.js");
const post_service_js_1 = __importDefault(require("./post.service.js"));
const validators = __importStar(require("./post.validation"));
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const multer_middleware_js_1 = require("../../middleware/multer.middleware.js");
const local_multer_js_1 = require("../../common/utilis/multer/local.multer.js");
const multer_enum_js_1 = require("../../common/enum/multer.enum.js");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/", (0, authentication_middleware_js_1.authentication)(), (0, multer_middleware_js_1.uploadMiddleware)({
    multerMiddleware: (0, local_multer_js_1.localFileUpload)({
        storageApproach: multer_enum_js_1.StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: local_multer_js_1.FileValidation.image,
    customPath: "Post",
    isRequired: false,
}), (0, validation_middleware_js_1.validation)(validators.createPost), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_js_1.default.createPost(req.user, req.validate.body, req.files);
    return { status: 201, data };
}));
router.get("/all-posts", (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await post_service_js_1.default.getAllPosts(req.user, { page, limit });
    return { status: 200, data };
}));
router.get("/:postId", (0, authentication_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validation)(validators.posIdValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_js_1.default.getSinglePost(req.validate.params.postId);
    return { status: 200, data };
}));
router.patch("/:postId", (0, authentication_middleware_js_1.authentication)(), (0, multer_middleware_js_1.uploadMiddleware)({
    multerMiddleware: (0, local_multer_js_1.localFileUpload)({
        storageApproach: multer_enum_js_1.StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: local_multer_js_1.FileValidation.image,
    customPath: "Post",
    isRequired: false,
}), (0, validation_middleware_js_1.validation)(validators.update), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_js_1.default.update(req.user, req.validate.body, req.files, req.params);
    return { res, data };
}));
router.delete("/:postId", (0, authentication_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validation)(validators.posIdValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_js_1.default.delete(req.validate.params.postId, req.user);
    return { res, data };
}));
exports.default = router;
