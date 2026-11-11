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
const authentication_service_1 = __importDefault(require("./authentication.service"));
const response_middleware_js_1 = require("../../middleware/response.middleware.js");
const validators = __importStar(require("./authentication.validation"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const issuer_js_1 = require("../../common/utilis/issuer.js");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/signup", (0, validation_middleware_1.validation)(validators.signup), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.signup(req.validate.body);
    return { status: 201, data };
}));
router.patch("/confirm-email", (0, validation_middleware_1.validation)(validators.confirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    return await authentication_service_1.default.confirmEmail(req.validate.body);
}));
router.patch("/enable-two-step-verification", (0, validation_middleware_1.validation)(validators.resendConfirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.enableTwoStepVerification(req.validate.body);
    return { res, status: 200, data };
}));
router.patch("/resend-confirm-email", (0, validation_middleware_1.validation)(validators.resendConfirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    return await authentication_service_1.default.resendConfirmEmail(req.validate.body);
}));
router.post("/signup-with-gmail", (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const { data, status } = await authentication_service_1.default.signupWithGmail(req.body, (0, issuer_js_1.getIssuer)(req));
    return { status: 201, data };
}));
router.post("/request-forgot-password", (0, validation_middleware_1.validation)(validators.resendConfirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.requestForgotPassword(req.validate.body);
    return { status: 200, data };
}));
router.post("/verify-forgot-password", (0, validation_middleware_1.validation)(validators.confirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.verifyForgotPassword(req.validate.body);
    return { status: 200, data };
}));
router.patch("/reset-forgot-password", (0, validation_middleware_1.validation)(validators.resetForgotPasswordValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.resetForgotPassword(req.validate.body);
    return { status: 200, data };
}));
router.patch("/verify-two-step-verification", (0, validation_middleware_1.validation)(validators.confirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.verifyTwoStepVerification(req.validate.body);
    return { res, status: 200, data };
}));
router.patch("/confirm-two-step-verification", (0, validation_middleware_1.validation)(validators.confirmEmailValidation), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.confirmLogin(req.validate.body, `${req.protocol}://${req.host}`);
    return { res, status: 200, data };
}));
router.post("/login", (0, validation_middleware_1.validation)(validators.login), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.login(req.validate.body, (0, issuer_js_1.getIssuer)(req));
    return { status: 200, data };
}));
exports.default = router;
