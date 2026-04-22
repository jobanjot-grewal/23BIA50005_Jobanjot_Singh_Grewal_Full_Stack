const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, updates) => {
  // Check username uniqueness if changing
  if (updates.username) {
    const existing = await User.findOne({ username: updates.username, _id: { $ne: userId } });
    if (existing) throw new ApiError(400, 'Username already taken');
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const searchUsers = async (query, currentUserId) => {
  if (!query || query.trim().length < 2) return [];

  const users = await User.find({
    $and: [
      { _id: { $ne: currentUserId } },
      { isBlocked: false },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      },
    ],
  })
    .select('name username email avatar bio lastSeen')
    .limit(20);

  return users;
};

const updateAvatar = async (userId, avatarPath) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarPath },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

module.exports = { getUserById, updateProfile, searchUsers, updateAvatar };
