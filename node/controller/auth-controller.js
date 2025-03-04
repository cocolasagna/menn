const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Set up Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Replace with your Google OAuth client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Replace with your Google OAuth client secret
    callbackURL: process.env.GOOGLE_CALLBACK_URL // Replace with your redirect URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // When OAuth login is successful, create JWT token for the user
    try {
      // You can customize the user object with info from the profile
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      };

      // Create a JWT token for the user
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      // Pass the token to the next middleware
      done(null, { token, user });
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
