import paymentService from '../services/payment.service.js';
import orderRepository from '../repositories/order.repository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Initiate Payment
// ─────────────────────────────────────────
export const initiatePayment = catchAsync(async (req, res) => {
  const { orderId, callbackUrl } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required',
    });
  }

  // Order user verify
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  const result = await paymentService.createPayment(
    orderId,
    order.totalAmount,
    callbackUrl
  );

  res.status(200).json({
    success: true,
    message: 'Payment initiated',
    data: result,
  });
});

// ─────────────────────────────────────────
// Payment Callback
// ─────────────────────────────────────────
export const paymentCallback = catchAsync(async (req, res) => {
  const { paymentID, status, orderId } = req.query;

  if (!paymentID || !status || !orderId) {
    return res.redirect(
      `${process.env.CLIENT_URL}/payment/failed?message=Invalid callback`
    );
  }

  try {
    const result = await paymentService.executePayment(
      paymentID,
      status,
      orderId
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}&trxID=${result.trxID}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.CLIENT_URL}/payment/failed?orderId=${orderId}&message=${error.message}`
    );
  }
});

// ─────────────────────────────────────────
// Verify Payment
// ─────────────────────────────────────────
export const verifyPayment = catchAsync(async (req, res) => {
  const { paymentID } = req.body;

  if (!paymentID) {
    return res.status(400).json({
      success: false,
      message: 'Payment ID is required',
    });
  }

  const result = await paymentService.queryPayment(paymentID);

  res.status(200).json({
    success: true,
    data: result,
  });
});

// ─────────────────────────────────────────
// Refund Payment (Admin)
// ─────────────────────────────────────────
export const refundPayment = catchAsync(async (req, res) => {
  const { paymentID, trxID, amount, reason } = req.body;

  if (!paymentID || !trxID || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Payment ID, transaction ID and amount are required',
    });
  }

  const result = await paymentService.refundPayment(
    paymentID,
    trxID,
    amount,
    reason
  );

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: result,
  });
});