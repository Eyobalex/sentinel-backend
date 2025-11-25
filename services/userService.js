const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

exports.createUser = async (userData) => {
  const { username, email, password } = userData;

  let user = await User.findOne({ email });
  if (user) {
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();
  return { id: user.id, username: user.username, email: user.email };
};

exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
