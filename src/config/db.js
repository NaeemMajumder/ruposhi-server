import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connection Events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB Reconnected');
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed (app termination)');
  process.exit(0);
});

export default connectDB;