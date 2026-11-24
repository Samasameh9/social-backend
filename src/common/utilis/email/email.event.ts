import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email";
import { confirmEmailTemplate } from "./template/confirmEmail.template";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const emailEvent = new EventEmitter();

emailEvent.on(
  "sendEmail",
  async ({
    recipient,
    subject,
    data,
  }: {
    subject: EmailSubjectEnum;
    recipient: { to?: string[], cc?: string[], bcc?: string[] };
    data: any;
  }) => {
    try {
      await sendEmail({
        ...recipient,
        subject,
        html: confirmEmailTemplate({ subject, data }),
      });
    } catch (error) {
      console.log(error);

      console.log("fail to send email");
    }
  },
);
