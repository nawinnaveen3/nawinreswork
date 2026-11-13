const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const pool = require('../config/database');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order using the amount stored in MySQL
router.post('/create-order', async (req, res) => {
  try {
    const restaurantOrderId = Number(req.body.restaurant_order_id);

    if (!Number.isInteger(restaurantOrderId) || restaurantOrderId <= 0) {
      return res.status(400).json({ message: 'Invalid restaurant order ID' });
    }

    const [rows] = await pool.query(
      `SELECT id, total_amount, payment_method, payment_status
       FROM orders
       WHERE id = ?`,
      [restaurantOrderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant order not found' });
    }

    const restaurantOrder = rows[0];

    if (
      restaurantOrder.payment_method !== 'Online Payment' ||
      restaurantOrder.payment_status !== 'Pending'
    ) {
      return res.status(400).json({
        message: 'Order is not eligible for online payment',
      });
    }

    const amountInPaise = Math.round(Number(restaurantOrder.total_amount) * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `restaurant_${restaurantOrderId}_${Date.now()}`,
    });

    await pool.query(
      `UPDATE orders
       SET razorpay_order_id = ?
       WHERE id = ? AND payment_status = 'Pending'`,
      [razorpayOrder.id, restaurantOrderId]
    );

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error.message);
    return res.status(500).json({
      message: 'Unable to create payment order',
    });
  }
});

// Verify payment and update MySQL only after successful verification
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      restaurant_order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const restaurantOrderId = Number(restaurant_order_id);

    if (
      !Number.isInteger(restaurantOrderId) ||
      restaurantOrderId <= 0 ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        verified: false,
        message: 'Missing or invalid payment details',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, total_amount, payment_method, payment_status,
              razorpay_order_id, razorpay_payment_id
       FROM orders
       WHERE id = ?`,
      [restaurantOrderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        verified: false,
        message: 'Restaurant order not found',
      });
    }

    const order = rows[0];

    if (
      order.payment_method !== 'Online Payment' ||
      order.razorpay_order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        verified: false,
        message: 'Payment does not match this restaurant order',
      });
    }

    // Validate Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        verified: false,
        message: 'Payment signature verification failed',
      });
    }

    // Confirm payment status and amount directly with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const expectedAmount = Math.round(Number(order.total_amount) * 100);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== 'captured' ||
      Number(payment.amount) !== expectedAmount ||
      payment.currency !== 'INR'
    ) {
      return res.status(400).json({
        verified: false,
        message: 'Payment is not captured or amount does not match',
      });
    }

    await pool.query(
      `UPDATE orders
       SET payment_status = 'Paid', razorpay_payment_id = ?
       WHERE id = ?
         AND razorpay_order_id = ?
         AND payment_status = 'Pending'`,
      [razorpay_payment_id, restaurantOrderId, razorpay_order_id]
    );

    const [updatedRows] = await pool.query(
      `SELECT payment_status, razorpay_payment_id
       FROM orders
       WHERE id = ?`,
      [restaurantOrderId]
    );

    if (
      updatedRows[0]?.payment_status !== 'Paid' ||
      updatedRows[0]?.razorpay_payment_id !== razorpay_payment_id
    ) {
      return res.status(409).json({
        verified: false,
        message: 'Could not update payment status',
      });
    }

    return res.json({
      verified: true,
      message: 'Payment verified and saved successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    return res.status(500).json({
      verified: false,
      message: 'Unable to verify payment',
    });
  }
});

module.exports = router;