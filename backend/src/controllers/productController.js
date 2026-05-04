const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Get all products (with filters & search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const {
    search,
    category,
    fragrance,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  // Build filter object
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category) filter.category = category;
  if (fragrance) filter.fragrance = { $regex: fragrance, $options: 'i' };
  if (featured === 'true') filter.isFeatured = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:slugOrId
// @access  Public
const getProduct = async (req, res) => {
  const { slugOrId } = req.params;

  // Try slug first, then ID
  let product = await Product.findOne({ slug: slugOrId, isActive: true });
  if (!product) {
    product = await Product.findById(slugOrId);
  }

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  const productData = req.body;

  // Upload images to Cloudinary
  if (req.files && req.files.length > 0) {
    const imageUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, 'rachvi-creation/products'))
    );
    productData.images = imageUploads.map((img, i) => ({
      url: img.url,
      public_id: img.public_id,
      alt: req.body.name || '',
    }));

    // Clean up temp files
    req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
  }

  const product = await Product.create(productData);
  res.status(201).json({ success: true, message: 'Product created', product });
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const imageUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, 'rachvi-creation/products'))
    );
    const newImages = imageUploads.map((img) => ({
      url: img.url,
      public_id: img.public_id,
      alt: product.name,
    }));
    req.body.images = [...product.images, ...newImages];
    req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: 'Product updated', product });
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Delete images from Cloudinary
  await Promise.all(
    product.images
      .filter((img) => img.public_id)
      .map((img) => deleteFromCloudinary(img.public_id))
  );

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'You already reviewed this product' });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.calculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added', reviews: product.reviews });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };
