import nodemailer from "nodemailer";
import { smtpHost, smtpPass, smtpUser } from "../config/index";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: `${smtpHost}`,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"I know Tennis" <${smtpUser}>`,
      to,
      subject,
      html,
    });

  } catch (error) {
    throw new Error("Email could not be sent");
  }
};
