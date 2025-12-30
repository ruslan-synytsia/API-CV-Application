const formDataService = require('./../Services/formDataService');
const Mailer = require('../Services/mailerService');

class sendMessageController {
  async sendMessage(req, res) {
    const { username, email, message } = req.body;

    try {
      const saved = await formDataService.createMessage({ username, email, message });

        new Mailer().sendMail({                         
            from: '',
            to: process.env.SMTP_USER,
            email,
            username,
            subject: "Message from CV",
            message,
            temp: 'mail-template' 
        }).catch(console.error);
        
        new Mailer().sendMail({ 
            from: 'Ruslan Synytsia <synytsiaruslan@gmail.com>',
            to: email,
            email: '',
            username,
            subject: "Thank you for your offer!",
            message: '',
            temp: 'response-mail-template'
        }).catch(console.error);

      return res.status(201).json({ ok: true, id: saved._id });
    } catch (e) {
      console.error("sendMessage failed:", e);
      return res.status(500).json({ ok: false, error: "Mongo save failed" });
    }
  }
}

module.exports = new sendMessageController();