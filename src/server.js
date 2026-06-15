import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });

    // Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();