const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
