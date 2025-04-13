const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return this.authType !== "google"; // Password is required unless authType is 'google'
      },
    },
    authType: {
      type: String,
      enum: ["google", "credentials"], // Allowed values are "google" or "credentials"
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Avoid model overwriting by checking if it already exists
module.exports = mongoose.model("User", userSchema);
