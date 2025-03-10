const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        chatId: {
            type: String,
            unique: true,  // Ensures no duplicate one-on-one chats
            sparse: true,  // Allows null for group chats
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        name: {
            type: String,
            required: function () {
                return this.isGroupChat; // Required only for group chats
            },
        },
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message',
            },
        ],
    },
    { timestamps: true }
);

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
