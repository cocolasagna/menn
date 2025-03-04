// routes/user-routes.js
const express = require('express');
const controls = require('../controller/user-controller');
const UserRouter = express.Router();
const authenticateToken = require('../middleware/authmiddleware');
const passport = require('passport');

UserRouter.post('/signup', controls.signupUser);
UserRouter.get('/getuser', authenticateToken, controls.getUser);
UserRouter.post('/login', controls.loginUser);

// Google OAuth routes
UserRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));

UserRouter.get('/auth/google/callback', 
  passport.authenticate('google', {session: false, failureRedirect: '/login' }),
  controls.googleAuthCallback
);

module.exports = UserRouter;
