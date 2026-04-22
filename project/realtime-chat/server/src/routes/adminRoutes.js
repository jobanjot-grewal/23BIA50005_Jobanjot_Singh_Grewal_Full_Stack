const router = require('express').Router();
const { getAllUsers, blockUser, unblockUser, getAnalytics } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/users', auth, admin, getAllUsers);
router.put('/users/:id/block', auth, admin, blockUser);
router.put('/users/:id/unblock', auth, admin, unblockUser);
router.get('/analytics', auth, admin, getAnalytics);

module.exports = router;
