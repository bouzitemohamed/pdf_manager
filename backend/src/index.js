require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const cookieParser = require('cookie-parser');
const passport     = require('./config/passport');
const { init: initSocket } = require('./services/socketService');
const seedAdmin = require('./utils/seed');

const authRoutes     = require('./routes/auth');
const serviceRoutes  = require('./routes/services');
const boxRoutes      = require('./routes/boxes');
const folderRoutes   = require('./routes/folders');
const pdfFileRoutes  = require('./routes/pdfFiles');
const adminRoutes    = require('./routes/admin');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
initSocket(server);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/boxes',    boxRoutes);
app.use('/api/folders',  folderRoutes);
app.use('/api/files',    pdfFileRoutes);
app.use('/api/admin',    adminRoutes);
app.get('/api/health',   (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdmin();
});

module.exports = app;
