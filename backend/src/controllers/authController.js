const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const { validationResult } = require("express-validator");
const { getAllUsers } = require("../services/userService");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "hazemfarhati@gmail.com",
    pass: "cdgq iuvf crbk nwvs",
  },
});

// Register User
const registerUser = async (req, res) => {
  const { username, nom, prenom, email, password } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ msg: "Email already exists" });
    }

    const salt = 10;
    const genSalt = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const newUser = new User({
      username,
      nom,
      prenom,
      email,
      password: hashedPassword,
      activationToken,
    });

    const result = await newUser.save();

    const verificationUrl = `http://localhost:5000/api/users/verify-account/${activationToken}`;
    const mailOptions = {
      from: "hazemfarhati@gmail.com",
      to: email,
      subject: "Verify Your Account",
      text: `To verify your account, please click the following link: ${verificationUrl}`,
    };

    await transporter.sendMail(mailOptions);

    const payload = { _id: result._id, nom: result.nom };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 1000 * 60 * 60 * 24,
    });

    res.send({
      user: result,
      msg: "User is saved",
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Cannot save the user");
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
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    const resetToken = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5000/api/users/reset-password/${resetToken}`;
    const mailOptions = {
      from: "hazemfarhati@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `To reset your password, please click the following link: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.send({ msg: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = 10;
    const genSalt = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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
