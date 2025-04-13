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
const passport = require("passport");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User with Credentials
// Register User
const registerUser = async (req, res) => {
  try {
    const { username, nom, prenom, email, password, authType } = req.body;

    // Validate fields (this might not be necessary for Google users)
    if (
      authType !== "google" &&
      (!username || !nom || !prenom || !email || !password)
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the email is already registered (with either credentials or Google)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // If authType is google, don't hash the password (Google users don't need a password)
    const hashedPassword =
      authType === "google" ? null : await hashPassword(password);

    // Generate activation token for normal users, but not for Google users
    const activationToken =
      authType === "google" ? null : generateToken({ email });

    // Save user
    const newUser = new User({
      username,
      nom,
      prenom,
      email,
      password: hashedPassword,
      activationToken,
      isActivated: authType === "google" ? true : false, // Directly set isActivated for Google
      authType: authType || "credentials", // Mark the type of authentication (Google or Credentials)
    });

    await newUser.save();

    if (authType === "google") {
      // If Google user, skip email verification process, send token directly
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res
        .status(200)
        .json({ user: newUser, msg: "Success", token: `Bearer ${token}` });
    }

    // Send verification email for normal users
    const verificationUrl = `http://localhost:5173/api/users/verify-account/${activationToken}`;
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

// Login User with Credentials
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

    // Check if the user is activated
    if (!searchedUser.isActivated) {
      return res.status(400).send({
        msg: "Account not verified. Please check your email for verification.",
      });
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

// Google Auth Routes
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = async (req, res) => {
  try {
    // Extract user details from the Google profile
    const { email, given_name, family_name, picture } = req.user;

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        username: given_name + family_name,
        nom: given_name,
        prenom: family_name,
        email,
        isActivated: true, // Ensure the account is activated for Google OAuth users
      });

      await user.save(); // Save new user
    } else {
      // If the user exists, make sure to set `isActivated` to true if it was false
      if (!user.isActivated) {
        user.isActivated = true;
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the user data and token back in the response
    res.redirect(`http://localhost:5173/oauth-success?token=Bearer ${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 2. Extract user info
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    // 3. Find or create the user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: given_name + family_name,
        nom: given_name,
        prenom: family_name,
        email,
        isActivated: true, // Google users are activated automatically
      });
      await user.save();
    } else if (!user.isActivated) {
      user.isActivated = true;
      await user.save();
    }

    // 4. Create JWT token
    const payloadToken = { _id: user._id, nom: user.nom };
    const jwtToken = jwt.sign(payloadToken, process.env.JWT_SECRET, {
      expiresIn: 1000 * 3600 * 24, // 24 hours
    });

    // 5. Return token and user info
    res.status(200).send({
      user,
      msg: "Google login success",
      token: `Bearer ${jwtToken}`,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).send({ msg: "Google login failed" });
  }
};
// Verify Account (For credentials-based registration)
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

    // Mark user as activated
    user.isActivated = true;
    user.activationToken = undefined; // Clear activation token
    await user.save();

    // Generate a new JWT token after activation
    const jwtToken = jwt.sign(
      { _id: user._id, email: user.email, nom: user.nom, prenom: user.prenom },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    // Respond with the new token
    res.status(200).json({
      message: "Account verified successfully",
      token: `Bearer ${jwtToken}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
    const resetUrl = `http://localhost:5173/api/users/reset-password/${resetToken}`;

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

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user); // User is already attached to req.user by authMiddleware
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

// Get All Users
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
  googleAuth,
  googleCallback,
  googleLogin,
};
