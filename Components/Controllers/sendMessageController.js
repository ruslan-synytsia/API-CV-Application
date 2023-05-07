const formDataService = require('./../Services/formDataService');
const Mailer = require('../Services/mailerService');

class sendMessageController {
    async sendMessage (req, res) {
        const { username, email, message } = req.body;
        try {
            await formDataService.createMessage({ username, email, message });
            try {
                await new Mailer().sendMail(
                    {
                        from: '',
                        to: process.env.SMTP_USER,
                        email,
                        username,
                        subject: "Message from CV",
                        message,
                        temp: 'mail-template'
                    });
            } catch (err) {
                console.error(err)
            }
            try {
                await new Mailer().sendMail(
                    {
                        from: 'Ruslan Synytsia <synytsiaruslan@gmail.com>',
                        to: email,
                        email: '',
                        username,
                        subject: "Thank you for your offer!",
                        message: '',
                        temp: 'response-mail-template'
                    });
            } catch (err) {
                console.error(err)
            }
            res.send('Message sent successfully!')
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new sendMessageController();