const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, notes } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  // Verify stock and calculate prices
  let itemsPrice = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }

    itemsPrice += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
    });

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingPrice = itemsPrice >= 500 ? 0 : 60; // Free shipping above ₹500
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    notes,
  });

  res.status(201).json({ success: true, order });
};

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay
// @access  Private
const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // amount in rupees

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);
  res.json({ success: true, order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Verify Razorpay payment & update order
// @route   POST /api/orders/:id/pay
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify signature
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSign !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'confirmed';
  order.paymentResult = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: 'paid',
    paid_at: new Date(),
  };

  await order.save();
  res.json({ success: true, message: 'Payment verified', order });
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('orderItems.product', 'name images');

  res.json({ success: true, orders });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Only allow owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, order });
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { orderStatus: status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, total });
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    // For COD, mark as paid on delivery
    if (order.paymentMethod === 'cod') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  await order.save();
  res.json({ success: true, message: 'Order status updated', order });
};

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
