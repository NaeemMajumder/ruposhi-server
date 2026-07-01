import axios from 'axios';
import orderRepository from '../repositories/order.repository.js';
import AppError from '../utils/AppError.js';

const BKASH_BASE_URL = process.env.BKASH_BASE_URL;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;

// ─────────────────────────────────────────
// Get bKash Token
// ─────────────────────────────────────────
const getBkashToken = async () => {
  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET,
      },
      {
        headers: {
          username: BKASH_USERNAME,
          password: BKASH_PASSWORD,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.statusCode !== '0000') {
      throw new AppError('Failed to get bKash token', 500);
    }

    return response.data.id_token;
  } catch (error) {
    throw new AppError('bKash token generation failed', 500);
  }
};

// ─────────────────────────────────────────
// Create Payment
// ─────────────────────────────────────────
const createPayment = async (orderId, amount, callbackUrl) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.paymentMethod !== 'bkash') {
    throw new AppError('This order does not support bKash payment', 400);
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('This order is already paid', 400);
  }

  const token = await getBkashToken();

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: orderId.toString(),
        callbackURL: callbackUrl || `${process.env.CLIENT_URL}/payment/callback`,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: order.orderNumber,
      },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': BKASH_APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.statusCode !== '0000') {
      throw new AppError(
        response.data.statusMessage || 'Payment creation failed',
        400
      );
    }

    return {
      paymentID: response.data.paymentID,
      bkashURL: response.data.bkashURL,
      successCallbackURL: response.data.successCallbackURL,
      failureCallbackURL: response.data.failureCallbackURL,
      cancelledCallbackURL: response.data.cancelledCallbackURL,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('bKash payment creation failed', 500);
  }
};

// ─────────────────────────────────────────
// Execute Payment (Callback)
// ─────────────────────────────────────────
const executePayment = async (paymentID, status, orderId) => {
  if (status === 'cancel') {
    throw new AppError('Payment cancelled by user', 400);
  }

  if (status === 'failure') {
    throw new AppError('Payment failed', 400);
  }

  const token = await getBkashToken();

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': BKASH_APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.statusCode !== '0000') {
      throw new AppError(
        response.data.statusMessage || 'Payment execution failed',
        400
      );
    }

    // Order payment status update
    const order = await orderRepository.updatePaymentStatus(orderId, {
      trxID: response.data.trxID,
      paymentID: response.data.paymentID,
      amount: parseFloat(response.data.amount),
      paidAt: new Date(),
    });

    // Order status confirmed করো
    await orderRepository.updateStatus(
      orderId,
      'confirmed',
      'Payment received via bKash'
    );

    return {
      success: true,
      trxID: response.data.trxID,
      amount: response.data.amount,
      order,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Payment execution failed', 500);
  }
};

// ─────────────────────────────────────────
// Query Payment (Verify)
// ─────────────────────────────────────────
const queryPayment = async (paymentID) => {
  const token = await getBkashToken();

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/payment/status`,
      { paymentID },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': BKASH_APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new AppError('Payment query failed', 500);
  }
};

// ─────────────────────────────────────────
// Refund Payment (Admin)
// ─────────────────────────────────────────
const refundPayment = async (paymentID, trxID, amount, reason) => {
  const token = await getBkashToken();

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
      {
        paymentID,
        trxID,
        amount: amount.toString(),
        currency: 'BDT',
        reason,
      },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': BKASH_APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.statusCode !== '0000') {
      throw new AppError(
        response.data.statusMessage || 'Refund failed',
        400
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Refund failed', 500);
  }
};

const paymentService = {
  createPayment,
  executePayment,
  queryPayment,
  refundPayment,
};

export default paymentService;