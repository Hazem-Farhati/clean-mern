const passport = require("passport");
const User = require("../models/User");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config(); // Make sure dotenv is required to load environment variables

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({ _id: jwt_payload._id }).select(
        "-password"
      );
      user ? done(null, user) : done(null, false);
    } catch (error) {
      console.log(error);
    }
  })
);
module.exports = isAuth = () =>
  passport.authenticate("jwt", { session: false });
