require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { createServer } = require('http')
const {Server} = require('socket.io')


require('./config/passport');

const app = express();

//socket server creation
const server = createServer(app);
const io = new Server(server,{
  cors:{
    origin:'http://localhost:3000',
    credentials:true,
    allowedHeaders:'Content-Type,Authorization'
  }
}


)

io.on('connection', (socket)=>{
  console.log('user connected')
  console.log('socket id', socket.id)
})


app.use(cors(
  {origin: 'http://localhost:3000', 
  credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
}
  
))
app.use(cookieParser())
// Middleware to parse JSON bodies
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

// Mount the user router at '/user'
const Userrouter = require('./routes/user-routes');
const Productrouter = require('./routes/product-routes');

app.use('/user', Userrouter);
app.use('/product', Productrouter)

// Start the server on port 3000
//app.listen(8000, () => console.log('Server running on port 8000'));

//Socket io 
server.listen(8000, ()=>{
  console.log('Port running on port 8080')
})
