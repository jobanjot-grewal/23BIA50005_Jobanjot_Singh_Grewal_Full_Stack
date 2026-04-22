const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const { user, token } = await authService.register({ name, username, email, password });
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
