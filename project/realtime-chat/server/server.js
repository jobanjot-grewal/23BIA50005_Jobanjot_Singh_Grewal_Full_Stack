const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');
const { initializeSocket } = require('./src/socket/index');

const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes if needed
app.set('io', io);

const start = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`\n🚀 Server running on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
