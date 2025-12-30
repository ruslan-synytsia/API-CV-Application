const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

class Mailer {
    constructor() {
        const port = Number(process.env.SMTP_PORT) || 587;
        const isSecure = port === 465;
        const transportOptions = {
            host: process.env.SMTP_HOST,
            port,
            secure: isSecure,
            requireTLS: !isSecure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        };

        if (isSecure) {
            transportOptions.tls = {
                rejectUnauthorized: false
            };
        }

        this.transporter = nodemailer.createTransport({
            ...transportOptions
        });
    }

    async sendMail({ from, to, email, username, subject, message, temp }) {
        const template = fs.readFileSync(path.join(__dirname, `../../Templates/${temp}.ejs`), 'utf-8');
        const html = ejs.render(template, { from, email, username, subject, message });

        const mailOptions = {
            from,
            to,
            email,
            username,
            subject,
            message,
            html
        };
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    }
}

module.exports = Mailer;
