require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { createServer } = require('http');
const { initializeSocket } = require('./socket');

require('./config/passport');

const app = express();
const server = createServer(app);

initializeSocket(server); // Initialize Socket.IO

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Mount routers
const Userrouter = require('./routes/user-routes');
const Productrouter = require('./routes/product-routes');
const ChatRouter = require('./routes/chat-routes');

app.use('/user', Userrouter);
app.use('/product', Productrouter);
app.use('/chat', ChatRouter);

server.listen(8000, () => {
    console.log('Server running on port 8000');
});

module.exports = { app, server };
