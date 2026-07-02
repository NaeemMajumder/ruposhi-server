import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import './config/cloudinary.js';

// ─────────────────────────────────────────
// Import all models — Mongoose register করার জন্য
// ─────────────────────────────────────────
import './models/User.model.js';
import './models/Category.model.js';
import './models/Product.model.js';
import './models/OTP.model.js';
import './models/Cart.model.js';
import './models/Coupon.model.js';
import './models/Order.model.js';
import './models/Review.model.js';
import './models/Testimonial.model.js';
import './models/Newsletter.model.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

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