import nodemailer = require("nodemailer");
import * as config from "../config"


export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email_host,
    port: config.email_port,
    secure: config.email_port == 465 ? true : false,
    auth: {
      user: config.email_username,
      pass: config.email_password
    }
  });

  const mailOptions = {
    from: `Street Repair <${config.email_username}>`,
    to: to,
    subject: subject,
    html: html
  };

  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);

  return info;
}