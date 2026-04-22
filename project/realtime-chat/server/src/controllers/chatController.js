const chatService = require('../services/chatService');

const createConversation = async (req, res, next) => {
  try {
    const { participantId, participants, type, groupName } = req.body;

    let conversation;
    if (type === 'group') {
      conversation = await chatService.createGroupConversation(req.user._id, {
        participants,
        groupName,
      });
    } else {
      conversation = await chatService.createDirectConversation(req.user._id, participantId);
    }

    res.status(201).json({ success: true, data: { conversation } });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getUserConversations(req.user._id);
    res.json({ success: true, data: { conversations } });
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await chatService.getConversationById(req.params.id, req.user._id);
    res.json({ success: true, data: { conversation } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createConversation, getConversations, getConversationById };
