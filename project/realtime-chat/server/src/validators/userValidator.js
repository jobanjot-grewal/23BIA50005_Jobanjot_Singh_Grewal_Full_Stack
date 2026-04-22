const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name max 50 chars'),
  body('bio').optional().trim().isLength({ max: 200 }).withMessage('Bio max 200 chars'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
];

module.exports = { updateProfileValidator };
