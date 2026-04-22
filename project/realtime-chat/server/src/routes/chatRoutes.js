const router = require('express').Router();
const { createConversation, getConversations, getConversationById } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, createConversation);
router.get('/', auth, getConversations);
router.get('/:id', auth, getConversationById);

module.exports = router;
