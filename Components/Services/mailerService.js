const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    this.transporter.verify()
      .then(() => console.log("SMTP OK"))
      .catch((e) => console.error("SMTP FAIL", e));
  }

  async sendMail({ from, to, email, username, subject, message, temp }) {
    const template = fs.readFileSync(
      path.join(__dirname, `../../Templates/${temp}.ejs`),
      "utf-8"
    );

    const html = ejs.render(template, { from, email, username, subject, message });

    const mailOptions = {
      from: from || process.env.SMTP_USER,
      to,
      subject,
      html,
      replyTo: email || undefined,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
    return info;
  }
}

module.exports = Mailer;