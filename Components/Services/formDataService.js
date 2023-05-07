const Message = require('../Models/Message.js');
// const mailService = require('./mailService.js');
// const tokenService = require('./tokenService.js');
// const UserDTO = require('./../dtos/user_dto.js');
// const uuid = require('uuid');
// const bcrypt = require('bcrypt');
// const fs = require('fs');

class formDataService {
    async createMessage(data) {
        const {username, email, message} = data;
        try {
            const newMessage = await Message.create({
                username,
                email,
                message,
            });
            console.log('New message created:\n', newMessage);
            return newMessage;
        } catch (err) {
            console.error(err);
            return err;
        }
    }
}

module.exports = new formDataService();
