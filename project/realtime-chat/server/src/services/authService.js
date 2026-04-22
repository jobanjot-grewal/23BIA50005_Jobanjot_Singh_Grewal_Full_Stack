const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/token');

const register = async ({ name, username, email, password }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(400, existingUser.email === email ? 'Email already registered' : 'Username already taken');
  }

  const user = await User.create({
    name,
    username,
    email,
    passwordHash: password,
  });

  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastSeen = new Date();
  await user.save();

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { register, login };
