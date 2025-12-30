const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    // 🔍 Диагностика при старте
    this.transporter.verify()
      .then(() => console.log("SMTP 465 OK"))
      .catch(err => console.error("SMTP 465 FAIL", err));
  }

  async sendMail({ from, to, email, username, subject, message, temp }) {
    const templatePath = path.join(
      __dirname,
      `../../Templates/${temp}.ejs`
    );

    const template = fs.readFileSync(templatePath, "utf-8");

    const html = ejs.render(template, {
      from,
      email,
      username,
      subject,
      message,
    });

    const mailOptions = {
      from: from || process.env.SMTP_USER,
      to,
      subject,
      html,
      replyTo: email || undefined,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  }
}

module.exports = Mailer;
