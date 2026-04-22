const adminService = require('../services/adminService');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await adminService.getAllUsers(parseInt(page), parseInt(limit));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await adminService.blockUser(req.params.id);
    res.json({ success: true, data: { user }, message: 'User blocked' });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await adminService.unblockUser(req.params.id);
    res.json({ success: true, data: { user }, message: 'User unblocked' });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json({ success: true, data: { analytics } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, blockUser, unblockUser, getAnalytics };
