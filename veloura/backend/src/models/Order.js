const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    image:    String,
    price:    Number,
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    name: String, phone: String, street: String,
    city: String, state: String, pincode: String,
  },
  paymentMethod:  { type: String, enum: ['razorpay','cod'], default: 'cod' },
  paymentResult:  { razorpay_order_id: String, razorpay_payment_id: String, razorpay_signature: String },
  itemsPrice:     { type: Number, default: 0 },
  shippingPrice:  { type: Number, default: 0 },
  totalPrice:     { type: Number, default: 0 },
  isPaid:         { type: Boolean, default: false },
  paidAt:         Date,
  orderStatus:    { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
  trackingNumber: String,
  deliveredAt:    Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
