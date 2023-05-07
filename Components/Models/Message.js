const mongoose = require('mongoose');

const Message = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        default: ""
    },
    email: {
        type: String,
        require: true,
        default: ""
    },
    message: {
        type: String,
        require: true,
        default: ""
    }
}, {timestamps: true});

module.exports = mongoose.model("Message", Message);