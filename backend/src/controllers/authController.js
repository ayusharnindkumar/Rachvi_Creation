const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  // Include password in query
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    message: 'Logged in successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images');
  res.json({ success: true, user });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Profile updated', user });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};

// @desc    Add/update address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // If marking as default, clear other defaults
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  const idx = user.wishlist.indexOf(productId);
  let action;

  if (idx === -1) {
    user.wishlist.push(productId);
    action = 'added';
  } else {
    user.wishlist.splice(idx, 1);
    action = 'removed';
  }

  await user.save();
  res.json({ success: true, message: `Product ${action} from wishlist`, wishlist: user.wishlist });
};

module.exports = { register, login, getMe, updateProfile, changePassword, addAddress, toggleWishlist };
