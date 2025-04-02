const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path as needed
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select("-password"); // Exclude password
    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
