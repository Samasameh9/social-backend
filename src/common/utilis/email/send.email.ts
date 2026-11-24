import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD } from "../../../config.js";
import { BadRequestException } from "../../exception/domain.exception.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const userEmailKey = ({
  email,
  subject,
}: {
  email: string;
  subject: EmailSubjectEnum;
}):string => {
  return `User::${email}::${subject}_otp`;
};

export const userEmailOtpTrialsKey = ({
  email,
  subject,
}: {
  email: string;
  subject: EmailSubjectEnum;
}):string => {
  return `User::${email}::${subject}_otp_trials`;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments = [],
}: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw new BadRequestException("invalid recipient");
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw new BadRequestException("invalid email content");
    }
    const info = await transporter.sendMail({
      from: `"sama" <${APP_EMAIL}>`,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    });
  } catch (err) {
    console.log(err);

    console.error("Error while sending mail:", err);
  }
}
