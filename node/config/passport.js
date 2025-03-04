const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      // Optionally, set passReqToCallback: true if you need the request object
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Filter out only the necessary fields from the Google profile.
        const filteredUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        };
        // Return only the filtered user (do not include the whole profile object)
        return done(null, filteredUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
