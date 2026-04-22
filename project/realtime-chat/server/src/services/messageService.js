const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ApiError = require('../utils/ApiError');

const sendMessage = async ({ conversationId, sender, text, attachments }) => {
  // Verify sender is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: sender,
  });

  if (!conversation) {
    throw new ApiError(403, 'You are not a member of this conversation');
  }

  const message = await Message.create({
    conversationId,
    sender,
    text,
    attachments: attachments || [],
    readBy: [sender],
  });

  // Update conversation's lastMessage and timestamps
  conversation.lastMessage = message._id;

  // Increment unread counts for all participants except sender
  conversation.participants.forEach((p) => {
    if (p.toString() !== sender.toString()) {
      const current = conversation.unreadCounts.get(p.toString()) || 0;
      conversation.unreadCounts.set(p.toString(), current + 1);
    }
  });

  await conversation.save();

  const populated = await message.populate('sender', 'name username avatar');
  return populated;
};

const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(403, 'You are not a member of this conversation');
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments({ conversationId });

  return {
    messages: messages.reverse(),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

const markMessagesAsRead = async (conversationId, userId) => {
  // Mark all unread messages in this conversation as read by this user
  await Message.updateMany(
    {
      conversationId,
      sender: { $ne: userId },
      readBy: { $nin: [userId] },
    },
    {
      $addToSet: { readBy: userId },
      $set: { status: 'read' },
    }
  );

  // Reset unread count for this user
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { [`unreadCounts.${userId}`]: 0 },
  });
};

module.exports = { sendMessage, getMessages, markMessagesAsRead };
