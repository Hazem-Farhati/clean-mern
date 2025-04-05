const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { expiresIn: "7d" });
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
