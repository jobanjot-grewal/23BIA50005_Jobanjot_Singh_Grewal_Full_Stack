const router = require('express').Router();
const { getProfile, updateProfile, uploadAvatar, searchUsers } = require('../controllers/userController');
const { updateProfileValidator } = require('../validators/userValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/search', auth, searchUsers);
router.get('/:id', auth, getProfile);
router.put('/profile', auth, updateProfileValidator, validate, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
