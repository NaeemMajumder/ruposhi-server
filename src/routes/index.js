import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import couponRoutes from './coupon.routes.js';
import reviewRoutes from './review.routes.js';
import paymentRoutes from './payment.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import newsletterRoutes from './newsletter.routes.js';


const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payment', paymentRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/newsletter', newsletterRoutes);


// বাকি routes পরে add হবে
// router.use('/admin', adminRoutes);

export default router;