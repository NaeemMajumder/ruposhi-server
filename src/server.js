import 'dotenv/config';
import app from './app.js';
import './config/cloudinary.js';

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

// ✅ Local development এ listen
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
}

export default app;