const messageService = require('../services/messageService');

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype,
        size: file.size,
      }));
    }

    const message = await messageService.sendMessage({
      conversationId,
      sender: req.user._id,
      text,
      attachments,
    });

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const result = await messageService.getMessages(
      conversationId,
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await messageService.markMessagesAsRead(req.params.conversationId, req.user._id);
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, markAsRead };
