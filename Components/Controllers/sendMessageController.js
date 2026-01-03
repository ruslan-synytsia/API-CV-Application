const formDataService = require("../Services/formDataService");
const Mailer = require("../Services/mailerService");

const normalizeEmail = (value) => {
  if (!value) return "";
  const match = String(value).match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
};

const isValidEmail = (value) => {
  const email = normalizeEmail(value);
  return email.includes("@");
};

class sendMessageController {
  async sendMessage(req, res) {
    const { username, email, message } = req.body;

    try {
      const saved = await formDataService.createMessage({ username, email, message });
      const mailer = new Mailer();
      const adminTo = process.env.RESEND_ADMIN_EMAIL;
      const senderEmail = normalizeEmail(email);

      const sendTasks = [];
      if (adminTo) {
        sendTasks.push(
          mailer.sendMail({
            to: adminTo,
            email: senderEmail,
            username,
            subject: "Message from CV",
            message,
            temp: "mail-template",
          })
        );
      } else {
        console.error("RESEND_ADMIN_EMAIL is missing");
      }

      if (isValidEmail(senderEmail)) {
        sendTasks.push(
          mailer.sendMail({
            to: senderEmail,
            email: adminTo || "",
            username,
            subject: "Thank you for your offer!",
            message: "",
            temp: "response-mail-template",
          })
        );
      } else {
        console.warn("Skipping auto-reply: invalid sender email", email);
      }

      const results = await Promise.allSettled(sendTasks);
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Email send failed:", result.reason);
        }
      });

      return res.status(201).json({ ok: true, id: saved._id });
    } catch (e) {
      console.error("sendMessage failed:", e);
      return res.status(500).json({ ok: false, error: "Mongo save failed" });
    }
  }
}

module.exports = new sendMessageController();
