import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);

// বাকি routes পরে add হবে
// router.use('/products', productRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/cart', cartRoutes);
// router.use('/orders', orderRoutes);
// router.use('/users', userRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/payment', paymentRoutes);
// router.use('/admin', adminRoutes);

export default router;