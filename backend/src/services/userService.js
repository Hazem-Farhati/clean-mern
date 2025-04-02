const User = require("../models/User");

const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

const getAllUsers = async () => {
  return await User.find().select("-password");
};

module.exports = { getUserById, getAllUsers };
