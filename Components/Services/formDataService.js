const Message = require('../Models/Message.js');

class FormDataService {
  async createMessage(data) {
    const { username, email, message } = data;

    try {
      const newMessage = await Message.create({ username, email, message });

      console.log("DB:", Message.db.name);
      console.log("Collection:", Message.collection.name);
      console.log("New message created:", newMessage._id);

      return newMessage;
    } catch (err) {
      console.error("Mongo save error:", err);
      throw err; // 🔴 КЛЮЧЕВО
    }
  }
}

module.exports = new FormDataService();
