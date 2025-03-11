// chatController.js

const { getSocketId, getIo } = require('../socket'); // Import socket helper
const Message = require('../model/message'); // Import your message model
const Chat = require('../model/chat')
const User = require('../model/user')



const sendMessageToUser = async (req, res) => {
    const { targetuserid, message } = req.body;
    const userid = req.user.id;

    const targetSocketId = getSocketId(targetuserid);
    const senderSocketId = getSocketId(userid);

    try {
       
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

const createGroupChat = async (req, res) => {
    try {
        const { name, members } = req.body;
        console.log('members', members);

        // Find user ids by their emails
        const memberIds = await User.find({ email: { $in: members } }).select('_id'); 

        // Check if all users are found
        if (memberIds.length !== members.length) {
            return res.status(400).json({ message: "Some users not found" });
        }

        // Add the admin user to the members list
        memberIds.push({ _id: req.user.id });
        console.log('memberIds', memberIds);

        // Create a new chat with the user ids as members
        const newChat = new Chat({
            name,
            members: memberIds.map(user => user._id.toString()),  // Ensure _id is converted to string
            admin: req.user.id,
            isGroupChat: true,
        });

        const result = await newChat.save();
        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getGroupChats = async(req,res)=>{
    try {
        const group = await Chat.find({
            isGroupChat: true,
            members: { $in: [req.user.id] }  // Check if the user's id is in the members array
        });
        
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        console.log('groupchats',group)
        res.status(200).json(group);
        
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });

    }
}







const sendMessageToGroup = async (req, res) => {
    const { groupId, message } = req.body;
    const userid = req.user.id;

   // const targetSocketId = getSocketId(targetuserid);
   // const senderSocketId = getSocketId(userid);

    try {
       
    //    if (!targetSocketId) {
         //   return res.status(404).json({ message: 'User not online' });
    //    }

        // Generate a unique chat ID for the two users
       

        // Check if the chat exists
        let existingchat = await Chat.findById({ groupId });

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
        
        //getIo().to(senderSocketId).emit('newMessage', newMessage);
       // getIo().to(targetSocketId).emit('newMessage', newMessage);

        return res.status(200).json(newMessage);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending message' });
    }
};


const getMessageforGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        //const targetuserid = req.params.targetuserid;
        const groudId = req.params.groupId;


        // Ensure both userId and targetuserid are provided
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'User ID or GroupId is missing' });
        }
        

        // Find the chat with both users
        const chat = await Chat.findById({
           groupId
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
module.exports = { sendMessageToUser , getMessageforUser  , createGroupChat , getGroupChats , sendMessageToGroup, getMessageforGroup};