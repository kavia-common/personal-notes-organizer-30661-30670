const { findUserById } = require('../store/db');

// PUBLIC_INTERFACE
function getMe(req, res, next) {
  /** Returns the authenticated user's profile. */
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getMe };
