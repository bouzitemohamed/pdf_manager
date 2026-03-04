let io = null;

const init = (httpServer) => {
  const { Server } = require('socket.io');
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const { role } = socket.handshake.query;

    // Admins join a dedicated room to receive admin-only events
    if (role === 'ADMIN') {
      socket.join('admins');
      console.log(`[Socket] Admin connected: ${socket.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io initialized');
  return io;
};

/**
 * Emit an event to all connected admins.
 * Safe to call even before init (will no-op).
 */
const notifyAdmins = (event, data) => {
  if (!io) return;
  io.to('admins').emit(event, { ...data, timestamp: new Date().toISOString() });
};

const getIO = () => io;

module.exports = { init, notifyAdmins, getIO };
