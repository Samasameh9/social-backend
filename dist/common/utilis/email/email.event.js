"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("./send.email");
const confirmEmail_template_1 = require("./template/confirmEmail.template");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipient, subject, data, }) => {
    try {
        await (0, send_email_1.sendEmail)({
            ...recipient,
            subject,
            html: (0, confirmEmail_template_1.confirmEmailTemplate)({ subject, data }),
        });
    }
    catch (error) {
        console.log(error);
        console.log("fail to send email");
    }
});
