const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  category:    { type: String, enum: ['floral','woody','citrus','festive'], required: true },
  price:       { type: Number, required: true },
  originalPrice: Number,
  description: { type: String, required: true },
  notes:       [String],
  badge:       String,
  wax:         { type: String, default: 'Soy' },
  burnTime:    { type: String, default: '45 hrs' },
  weight:      { type: String, default: '200g' },
  images:      [{ url: String, public_id: String }],
  stock:       { type: Number, default: 100 },
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  reviews:     [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:   String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  next();
});

module.exports = mongoose.model('Product', productSchema);
