// controller/user-controller.js
require('dotenv').config();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
};

const signupUser = async (req, res, next) => {
  console.log(req.body)
  const { username, email, password, name } = req.body;
  if (!username || !email || !password || !name) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = req.body.role || 'user';
    const newUser = new User({ username, email, name, password: passwordHash , role:userRole });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const currentUser = req.user.email
    const user = await User.findOne({ email: currentUser })
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const token = generateToken(user)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000
    });
    res.status(200).json({ success: true, message: 'Logged in successfully'});
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    // req.user should be the filtered object: { googleId, email, name }
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const { googleId, email, name } = req.user;
    


    // Check if the user already exists
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name });
      
      await user.save();
    }

    // Generate JWT for the authenticated user
    const token = generateToken(user);
   
    // Store the token in an HTTP-only secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour
    });

  /* res.status(200).json({
      message: 'Authentication successful',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      }
    });*/
   res.status(200).redirect('http://localhost:3000/')
    
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { signupUser, getUserDetail, loginUser, googleAuthCallback };
