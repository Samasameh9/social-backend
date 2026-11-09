"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEmailOtpTrialsKey = exports.userEmailKey = void 0;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_js_1 = require("../../../config.js");
const domain_exception_js_1 = require("../../exception/domain.exception.js");
const userEmailKey = ({ email, subject, }) => {
    return `User::${email}::${subject}_otp`;
};
exports.userEmailKey = userEmailKey;
const userEmailOtpTrialsKey = ({ email, subject, }) => {
    return `User::${email}::${subject}_otp_trials`;
};
exports.userEmailOtpTrialsKey = userEmailOtpTrialsKey;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_js_1.APP_EMAIL,
        pass: config_js_1.APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
async function sendEmail({ to, cc, bcc, subject, text, html, attachments = [], }) {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw new domain_exception_js_1.BadRequestException("invalid recipient");
        }
        if (!text?.length && !html?.length && !attachments?.length) {
            throw new domain_exception_js_1.BadRequestException("invalid email content");
        }
        const info = await transporter.sendMail({
            from: `"sama" <${config_js_1.APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments,
        });
    }
    catch (err) {
        console.log(err);
        console.error("Error while sending mail:", err);
    }
}
