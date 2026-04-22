const Conversation = require('../models/Conversation');
const ApiError = require('../utils/ApiError');

const createDirectConversation = async (userId, participantId) => {
  // Check if direct conversation already exists
  const existing = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userId, participantId], $size: 2 },
  }).populate('participants', 'name username avatar lastSeen')
    .populate('lastMessage');

  if (existing) return existing;

  const conversation = await Conversation.create({
    participants: [userId, participantId],
    type: 'direct',
    createdBy: userId,
  });

  return conversation.populate('participants', 'name username avatar lastSeen');
};

const createGroupConversation = async (userId, { participants, groupName }) => {
  if (!participants || participants.length < 2) {
    throw new ApiError(400, 'Group needs at least 3 members including you');
  }

  const allParticipants = [...new Set([userId, ...participants])];

  const conversation = await Conversation.create({
    participants: allParticipants,
    type: 'group',
    groupName: groupName || 'New Group',
    createdBy: userId,
  });

  return conversation.populate('participants', 'name username avatar lastSeen');
};

const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name username avatar lastSeen')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name username' },
    })
    .sort({ updatedAt: -1 });

  return conversations;
};

const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })
    .populate('participants', 'name username avatar bio lastSeen')
    .populate('lastMessage');

  if (!conversation) throw new ApiError(404, 'Conversation not found');
  return conversation;
};

module.exports = {
  createDirectConversation,
  createGroupConversation,
  getUserConversations,
  getConversationById,
};
