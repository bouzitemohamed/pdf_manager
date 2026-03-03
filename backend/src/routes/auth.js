const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, refresh, logout, googleCallback, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Local auth
router.post('/register', register);
router.post('/login', passport.authenticate('local', { session: false }), login);

// Token management
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  googleCallback
);

// Profile
router.get('/me', authenticate, getMe);

module.exports = router;
