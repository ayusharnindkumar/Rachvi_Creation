const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).select('-password'),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total });
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User role updated', user });
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    recentOrders,
    totalRevenue,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      ordersByStatus,
    },
  });
};

module.exports = { getAllUsers, updateUserRole, getDashboardStats };
