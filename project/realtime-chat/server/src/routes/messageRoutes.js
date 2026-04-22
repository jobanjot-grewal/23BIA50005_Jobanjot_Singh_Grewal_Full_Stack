const router = require('express').Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

router.post('/', auth, upload.array('attachments', 5), sendMessage);
router.get('/:conversationId', auth, getMessages);
router.put('/:conversationId/read', auth, markAsRead);

module.exports = router;
