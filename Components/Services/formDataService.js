const Message = require('../Models/Message.js');

class formDataService {
    try {
        const newMessage = await Message.create({ username, email, message });
        console.log("DB:", Message.db.name);
        console.log("Collection:", Message.collection.name);
        console.log('New message created:\n', newMessage);
        return newMessage;
    } catch (err) {
        console.error("Mongo save error:", err);
        throw err;
    }
}

module.exports = new formDataService();
