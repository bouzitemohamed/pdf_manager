const passport = require('passport');
const prisma = require('../config/db');

/**
 * requireAdmin — two-layer check:
 * 1. Valid JWT (passport jwt strategy)
 * 2. User's role in DB is ADMIN and account is not suspended
 *
 * We re-fetch from DB every time so role changes take effect immediately
 * without waiting for the token to expire.
 */
const requireAdmin = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      // Always re-fetch to get the latest role — never trust the cached user object
      const freshUser = await prisma.user.findUnique({ where: { id: user.id } });

      if (!freshUser || freshUser.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      if (freshUser.suspended) {
        return res.status(403).json({ message: 'Account suspended' });
      }

      req.user = freshUser;
      next();
    } catch (dbErr) {
      return next(dbErr);
    }
  })(req, res, next);
};

module.exports = { requireAdmin };
