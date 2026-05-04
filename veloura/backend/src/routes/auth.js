const router = require('express').Router();
const User = require('../models/User');
const { signToken, protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, token: signToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json({ success: true, token: signToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, wishlist: user.wishlist, addresses: user.addresses } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Update profile
router.put('/update', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle wishlist
router.put('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const id = req.params.productId;
    const idx = user.wishlist.indexOf(id);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(id);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
