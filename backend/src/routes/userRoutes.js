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
} = require("../controllers/authController");
const {
  loginRules,
  registerRules,
  Validation,
} = require("../middleware/auth-validator");
const isAuth = require("../middleware/passport");
const authMiddleware = require("../middleware/authMiddleware");

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
// get all users route
userRouter.get("/getAllUsers", getAllUsersController);

// current user route

userRouter.get("/current", authMiddleware, getCurrentUser);

module.exports = userRouter;
