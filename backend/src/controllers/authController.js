const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { generateToken } = require("../utils/token");
const { hashPassword, comparePassword } = require("../utils/password");
const sendEmail = require("../utils/email");

const { validationResult } = require("express-validator");
const { getAllUsers } = require("../services/userService");
const errorHandler = require("../utils/errorHandler");

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, nom, prenom, email, password } = req.body;

    // Validate fields
    if (!username || !nom || !prenom || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate activation token
    const activationToken = generateToken({ email });

    // Save user
    const newUser = new User({
      username,
      nom,
      prenom,
      email,
      password: hashedPassword,
      activationToken,
    });

    await newUser.save();

    // Send email
    const verificationUrl = `http://localhost:5000/api/users/verify-account/${activationToken}`;
    await sendEmail(
      email,
      "Verify Your Account",
      `Click here: ${verificationUrl}`
    );

    res.json({ msg: "User registered. Please check your email." });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const searchedUser = await User.findOne({ email });
    if (!searchedUser) {
      return res.status(400).send({ msg: "Bad credentials" });
    }

    const match = await bcrypt.compare(password, searchedUser.password);
    if (!match) {
      return res.status(400).send({ msg: "Bad credentials" });
    }

    const payload = { _id: searchedUser.id, nom: searchedUser.nom };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 1000 * 3600 * 24,
    });

    res
      .status(200)
      .send({ user: searchedUser, msg: "Success", token: `Bearer ${token}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Cannot get the user" });
  }
};

// Verify Account
const verifyAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      activationToken: token,
      isActivated: false,
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isActivated = true;
    user.activationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot Password
// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save reset token and expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Construct the reset URL
    const resetUrl = `http://localhost:5000/api/users/reset-password/${resetToken}`;

    // Log to check the data before sending
    console.log("Sending email to:", email);
    console.log("Subject:", "Reset Your Password");
    console.log(
      "Body:",
      `To reset your password, please click the following link: ${resetUrl}`
    );

    // Send the email
    await sendEmail(
      email,
      "Reset Your Password",
      `To reset your password, please click the following link: ${resetUrl}`
    );

    res.status(200).json({ msg: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ msg: "Password is required" });
  }

  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ msg: "Token has expired" });
    }

    // Hash the new password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined; // Clear expiration time
    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user); // User is already attached to req.user by authMiddleware
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyAccount,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getAllUsersController,
};
