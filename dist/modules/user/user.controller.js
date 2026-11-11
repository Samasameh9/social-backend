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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const security_enum_js_1 = require("../../common/enum/security.enum.js");
const user_service_js_1 = require("./user.service.js");
const issuer_js_1 = require("../../common/utilis/issuer.js");
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const validators = __importStar(require("./user.validation"));
const local_multer_js_1 = require("../../common/utilis/multer/local.multer.js");
const multer_enum_js_1 = require("../../common/enum/multer.enum.js");
const router = (0, express_1.Router)({ caseSensitive: true, strict: true });
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.profile(req.user);
    return { data };
}));
router.patch("/", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_enum_js_1.RoleEnum.ADMIN), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.update(req.user, req.body);
    return { res, data };
}));
router.post("/rotate-token", (0, middleware_1.authentication)(security_enum_js_1.TokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.rotateToken(req.payload, req.user, (0, issuer_js_1.getIssuer)(req));
    return { res, data };
}));
router.post("/follow-unfollow", (0, middleware_1.validation)(validators.followUnfollowSchema), (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.followUnFollow(req.validate.body.userId, req.user._id.toString(), req.validate.body.action);
    return { res, data };
}));
router.get("/search", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.searchUsersSchema), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.search(req.validate.query.keyword, req.validate.query.page, req.validate.query.limit);
    return { res, data };
}));
router.get("/suggestions", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.suggestionsUsersSchema), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.suggestions(req.user.id, req.validate.query.page, req.validate.query.limit);
    return { res, data };
}));
router.patch("/profile-image", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, local_multer_js_1.localFileUpload)({
        storageApproach: multer_enum_js_1.StorageApproachEnum.MEMORY,
    }).single("attachment"),
    validation: local_multer_js_1.FileValidation.image,
    customPath: "User",
}), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const key = await user_service_js_1.userService.profileImage(req.file, req.user);
    return { data: { key } };
}));
router.patch("/privacy", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.updatePrivacy(req.user.id, req.body.privacy);
    return { res, data };
}));
router.post("/logout", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.userService.logout(req.payload, req.user, req.body);
    return { res, data };
}));
exports.default = router;
