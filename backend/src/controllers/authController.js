const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_OPTIONS,
} = require('../utils/jwt');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed } });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: { push: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const user = req.user; // populated by passport local
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: { push: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Refresh ──────────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: 'Refresh token reuse detected' });
    }

    // Rotate token
    const newRefreshToken = generateRefreshToken(user.id);
    const newAccessToken = generateAccessToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          set: [...user.refreshTokens.filter((t) => t !== token), newRefreshToken],
        },
      },
    });

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          refreshTokens: { set: req.user.refreshTokens.filter((t) => t !== token) },
        },
      });
    }
    res.clearCookie('refreshToken', { path: '/' });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Google Callback ──────────────────────────────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: { push: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    // Redirect to frontend with token in query (or use a different secure mechanism)
    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const { id, email, createdAt } = req.user;
  return res.json({ id, email, createdAt });
};

module.exports = { register, login, refresh, logout, googleCallback, getMe };
