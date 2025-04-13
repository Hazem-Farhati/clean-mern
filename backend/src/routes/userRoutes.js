const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  loginUser,
  verifyAccount,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getAllUsersController,
  googleAuth,
  googleCallback,
  googleLogin,
} = require("../controllers/authController");
const {
  loginRules,
  registerRules,
  Validation,
} = require("../middleware/auth-validator");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require("passport");

// Register route
userRouter.post("/register", registerRules(), Validation, registerUser);

// Login route
userRouter.post("/login", loginRules(), Validation, loginUser);

// Verify account route
userRouter.post("/verify-account/:token", verifyAccount);

// Forgot password route
userRouter.post("/forgot-password", forgotPassword);

// Reset password route
userRouter.post("/reset-password/:token", resetPassword);

// Get all users route
userRouter.get("/getAllUsers", getAllUsersController);

// Current user route
userRouter.get("/current", authMiddleware, getCurrentUser);

// === Google OAuth Routes ===
userRouter.get("/google", googleAuth);

// Google callback route (Handle registration and login)
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback
);

userRouter.post("/google/callback", googleLogin);

module.exports = userRouter;
