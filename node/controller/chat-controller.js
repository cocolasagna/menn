// chatController.js

const { getSocketId, getIo } = require('../socket'); // Import socket helper
const Message = require('../model/message'); // Import your message model
const Chat = require('../model/chat')


const sendMessageToUser = async (req, res) => {
    const { targetuserid, message } = req.body;
    const userid = req.user.id
    try {
        const targetSocketId = getSocketId(targetuserid);
        const senderSocketId = getSocketId(userid)
        if (!targetSocketId) {
            return res.status(404).json({ message: 'User not online' });
        }

      
         
        const existingchat = await Chat.findOne({
            members:{$all:[targetuserid , req.user.id]}
        })
        if(!existingchat){
            const newChat = new Chat({
                admin : req.user.id,
                members:[req.user.id,targetuserid],
                messages:[]
            })
            await newChat.save()
            existingchat = newChat
        }
       


        const newMessage = new Message({
            text: message,

            chat: existingchat._id,
            sender: req.user.id,
        });
        await newMessage.save();
        existingchat.messages.push(newMessage._id)
        await existingchat.save();
     
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

        // Find the chat with both users
        const chat = await Chat.findOne({
            members: { $all: [userId, targetuserid] }
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
