const mongoose = require('mongoose');

// Review sub-schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number, // For showing discount/strikethrough
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        public_id: { type: String }, // Cloudinary public_id for deletion
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ['scented', 'festive', 'jar', 'matka', 'decorative', 'gift-set'],
    },
    fragrance: {
      type: String,
      required: true,
      // e.g. lavender, rose, coffee, vanilla, sandalwood, jasmine
    },
    weight: {
      type: String, // e.g. "200g"
    },
    burnTime: {
      type: String, // e.g. "40-45 hours"
    },
    material: {
      type: String,
      default: 'Soy Wax',
    },
    tags: [String], // e.g. ["aromatherapy", "gift", "eco-friendly"]
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Recalculate average rating whenever reviews are updated
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
