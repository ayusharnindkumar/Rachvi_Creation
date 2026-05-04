const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems?.length) return res.status(400).json({ success: false, message: 'No items in order' });
    const itemsPrice = orderItems.reduce((s,i)=>s+(i.price*i.quantity),0);
    const shippingPrice = itemsPrice >= 999 ? 0 : 99;
    const order = await Order.create({
      user: req.user._id, orderItems, shippingAddress,
      paymentMethod, itemsPrice, shippingPrice, totalPrice: itemsPrice + shippingPrice
    });
    // Decrement stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get my orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user','name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorised' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark as paid (after Razorpay verification)
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body;
    order.orderStatus = 'confirmed';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ADMIN: Get all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user','name email').sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: Update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const update = { orderStatus };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (orderStatus === 'delivered') update.deliveredAt = Date.now();
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
