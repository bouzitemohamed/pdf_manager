const passport = require('passport');
const prisma = require('../config/db');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Re-fetch to catch suspension changes in real-time
    try {
      const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!freshUser) return res.status(401).json({ message: 'User not found' });
      if (freshUser.suspended) return res.status(403).json({ message: 'Account suspended' });
      req.user = freshUser;
      next();
    } catch (e) {
      return next(e);
    }
  })(req, res, next);
};

module.exports = { authenticate };
