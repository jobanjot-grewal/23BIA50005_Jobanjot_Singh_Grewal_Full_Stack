const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const messageService = require('../services/messageService');

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);

      if (!user || user.isBlocked) {
        return next(new Error('User not found or blocked'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(userId);

    // Broadcast online status
    io.emit('user_online', { userId });

    // Send current online users list
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('online_users', onlineUserIds);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    // Send message via socket
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text, attachments } = data;

        const message = await messageService.sendMessage({
          conversationId,
          sender: userId,
          text,
          attachments: attachments || [],
        });

        // Emit to all users in the conversation room
        io.to(`conv_${conversationId}`).emit('new_message', message);

        // Also emit to participant personal rooms for notification
        const Conversation = require('../models/Conversation');
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          conv.participants.forEach((pId) => {
            const pid = pId.toString();
            if (pid !== userId) {
              io.to(pid).emit('message_notification', {
                conversationId,
                message,
              });
            }
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping: false,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await messageService.markMessagesAsRead(conversationId, userId);
        socket.to(`conv_${conversationId}`).emit('messages_read', {
          conversationId,
          userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Update lastSeen
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
          io.emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
};

module.exports = { initializeSocket, onlineUsers };
