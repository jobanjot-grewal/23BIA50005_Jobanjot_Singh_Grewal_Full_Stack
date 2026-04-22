const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');

const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await User.countDocuments();
  return { users, total, page, pages: Math.ceil(total / limit) };
};

const blockUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const unblockUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const getAnalytics = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  const totalConversations = await Conversation.countDocuments();
  const totalMessages = await Message.countDocuments();
  const blockedUsers = await User.countDocuments({ isBlocked: true });

  return {
    totalUsers,
    activeUsers,
    totalConversations,
    totalMessages,
    blockedUsers,
  };
};

module.exports = { getAllUsers, blockUser, unblockUser, getAnalytics };
