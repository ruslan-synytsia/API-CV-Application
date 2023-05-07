const router = require('express').Router();
const sendMessageController = require('../Controllers/sendMessageController');

router.post("/send-message", sendMessageController.sendMessage);

module.exports = router;