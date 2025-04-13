const passport = require("passport");
const User = require("../models/User");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// === JWT STRATEGY ===
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload._id).select("-password");
      user ? done(null, user) : done(null, false);
    } catch (error) {
      console.error(error);
      done(error, false);
    }
  })
);

// === GOOGLE STRATEGY ===
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.displayName,
            nom: profile.name.familyName,
            prenom: profile.name.givenName,
            email: email,
            password: "", // Pas de password pour OAuth
            isActivated: true,
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// === SERIALIZATION (utile si jamais tu veux utiliser les sessions un jour) ===
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// === JWT middleware ===
module.exports = isAuth = () =>
  passport.authenticate("jwt", { session: false });
