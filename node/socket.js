const redis = require('./RedisClient');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // To store userId to socketId mapping

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
            allowedHeaders: 'Content-Type,Authorization',
            transports: ['websocket'],
        },
    });

    // Use middleware to authenticate socket connection
    io.use(async(socket, next) => {
        const token = socket.handshake.headers.cookie
            ?.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        

        if (!token) {
            return next(new Error('Authentication error: no token'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            
            socket.userId = decoded.id; // Store user ID inside the socket instance
            
            // Optionally track the user with their socketId
            connectedUsers.set(socket.userId, socket.id);
           // console.log('connected-users',connectedUsers)

            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid or expired token'));
        }
    });

    // Handle new socket connection
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);



        socket.on('joinPrivateRoom' , (target)=>{
            const targetUserId  = target.targetUserId
            const userId = target.userId
            const chatId = [targetUserId , userId].sort().join('_')
            socket.join(chatId)
            console.log(`User joined Private room: ${chatId}`)

        })

        socket.on('joinGroupRoom', (groupId)=>{
            socket.join(groupId)
            console.log(`User joined room: ${groupId}`)
        })
        

       /* socket.on('userConnected',async(userId)=>{
            await redis.hset('OnlineUsers',userId,socket.id)
            console.log(`User connected:${userId}`)

        })*/


        socket.on('typing', ({selectedUserId})=>{
            const targetSocketId = getSocketId(selectedUserId);           
            io.to(targetSocketId).emit('typing' , {userId: socket.userId , typing:true} )
        })

      

        socket.on('disconnect', async() => {
           // await redis.hdel("onlineUsers", userId);
            console.log(`User disconnected: ${socket.userId}`);
            connectedUsers.delete(socket.userId); // Remove user from connected users map
        });
    });

};

// Function to retrieve socketId based on userId
const getSocketId = (userId) => connectedUsers.get(userId);

const getIo = () => io;

module.exports = { initializeSocket, getSocketId, getIo };
