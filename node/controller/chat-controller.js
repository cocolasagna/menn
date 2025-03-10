// chatController.js

const { getSocketId, getIo } = require('../socket'); // Import socket helper
const Message = require('../model/message'); // Import your message model
const Chat = require('../model/chat')


const sendMessageToUser = async (req, res) => {
    const { targetuserid, message } = req.body;
    const userid = req.user.id;
    try {
        const targetSocketId = getSocketId(targetuserid);
        const senderSocketId = getSocketId(userid);
    //    if (!targetSocketId) {
         //   return res.status(404).json({ message: 'User not online' });
    //    }

        // Generate a unique chat ID for the two users
        var chatId = [userid, targetuserid].sort().join('_');
        console.log('chat', chatId);

        // Check if the chat exists
        let existingchat = await Chat.findOne({ chatId });

        // If chat doesn't exist, create a new one
        if (!existingchat) {
            existingchat = new Chat({
                admin: req.user.id,
                chatId,
                members: [req.user.id, targetuserid],
                messages: [],
            });
            await existingchat.save();
        }

        // Create a new message
        const newMessage = new Message({
            text: message,
            chat: existingchat._id,
            sender: req.user.id,
        });
        await newMessage.save();

        // Add message to the chat
        existingchat.messages.push(newMessage._id);
        await existingchat.save();

        // Emit new message event to both sender and receiver
        getIo().to(senderSocketId).emit('newMessage', newMessage);
        getIo().to(targetSocketId).emit('newMessage', newMessage);

        return res.status(200).json(newMessage);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending message' });
    }
};


const getMessageforUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetuserid = req.params.targetuserid;

        // Ensure both userId and targetuserid are provided
        if (!userId || !targetuserid) {
            return res.status(400).json({ message: 'User ID or Target User ID is missing' });
        }
        var chatId = [userId, targetuserid].sort().join('_');

        // Find the chat with both users
        const chat = await Chat.findOne({
           chatId
        }).populate({
            path: 'messages',
            select: 'text sender createdAt'  // Populate sender and createdAt for frontend use
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json({chat});
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



// Export the function
module.exports = { sendMessageToUser , getMessageforUser };
