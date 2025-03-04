// model/user.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    // For email/password users; not required for Google users
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,  // Hashed password for email/password login
  },
  name: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true   // Allows multiple documents with no googleId
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
