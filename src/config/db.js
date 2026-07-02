import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // ✅ bufferCommands remove করো
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;