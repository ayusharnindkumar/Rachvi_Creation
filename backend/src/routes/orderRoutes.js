const express = require('express');
const router = express.Router();
const {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.post('/razorpay', createRazorpayOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);
router.post('/:id/pay', verifyPayment);

// Admin routes
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
