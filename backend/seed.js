/**
 * Seed script - Populates the database with sample Rachvi Creation products
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const sampleProducts = [
  {
    name: 'Lavender Bliss Soy Candle',
    description: 'Immerse yourself in the calming embrace of pure lavender. Hand-poured in a beautiful glass jar, topped with dried lavender buds and rose petals. Made from 100% natural soy wax with a cotton wick. Perfect for relaxation and aromatherapy.',
    shortDescription: 'Pure lavender aromatherapy soy candle with dried florals',
    price: 549,
    originalPrice: 699,
    images: [
      { url: 'https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=600', alt: 'Lavender Bliss Candle' }
    ],
    category: 'scented',
    fragrance: 'lavender',
    weight: '200g',
    burnTime: '40-45 hours',
    material: 'Soy Wax',
    tags: ['aromatherapy', 'lavender', 'relaxation', 'gift'],
    stock: 50,
    isFeatured: true,
    rating: 4.8,
    numReviews: 124,
  },
  {
    name: 'Coffee Latte Candle',
    description: 'The warm, comforting aroma of freshly brewed coffee latte. Hand-crafted with real coffee beans embedded in the wax. This unique candle fills your space with the irresistible scent of a cozy coffee shop. Made with premium soy wax.',
    shortDescription: 'Rich coffee-scented candle with real coffee beans',
    price: 599,
    originalPrice: 799,
    images: [
      { url: 'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600', alt: 'Coffee Latte Candle' }
    ],
    category: 'jar',
    fragrance: 'coffee',
    weight: '200g',
    burnTime: '40-45 hours',
    material: 'Soy Wax',
    tags: ['coffee', 'cozy', 'unique', 'gift'],
    stock: 35,
    isFeatured: true,
    rating: 4.9,
    numReviews: 89,
  },
  {
    name: 'Rose Matka Candle',
    description: 'A traditional Indian matka (clay pot) transformed into a stunning handcrafted candle. Filled with rose-scented soy wax and topped with dried rose petals. The earthy clay aroma blends beautifully with rose fragrance. A truly unique piece of art.',
    shortDescription: 'Handcrafted clay matka candle with rose fragrance',
    price: 649,
    originalPrice: 849,
    images: [
      { url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600', alt: 'Rose Matka Candle' }
    ],
    category: 'matka',
    fragrance: 'rose',
    weight: '250g',
    burnTime: '45-50 hours',
    material: 'Soy Wax in Clay Pot',
    tags: ['matka', 'rose', 'traditional', 'artisan', 'diwali'],
    stock: 20,
    isFeatured: true,
    rating: 4.9,
    numReviews: 67,
  },
  {
    name: 'Vanilla Dream Candle',
    description: 'Warm, sweet, and utterly comforting. Our Vanilla Dream candle is hand-poured with pure soy wax infused with Madagascar vanilla. Topped with delicate white flowers, it creates a soft, cozy ambiance perfect for evenings.',
    shortDescription: 'Sweet vanilla soy candle with floral topping',
    price: 499,
    originalPrice: 649,
    images: [
      { url: 'https://images.unsplash.com/photo-1603905560952-c7c63efec6f4?w=600', alt: 'Vanilla Dream Candle' }
    ],
    category: 'scented',
    fragrance: 'vanilla',
    weight: '200g',
    burnTime: '38-42 hours',
    material: 'Soy Wax',
    tags: ['vanilla', 'sweet', 'cozy', 'relaxation'],
    stock: 60,
    isFeatured: false,
    rating: 4.7,
    numReviews: 95,
  },
  {
    name: 'Festive Gift Set - Trio',
    description: 'The perfect gift for every occasion! This luxurious gift set contains three of our bestselling candles: Rose Serenity, Lavender Bliss, and Vanilla Dream. Beautifully packaged in our signature gift box with a satin ribbon and personalized thank-you card.',
    shortDescription: 'Premium 3-candle gift set in luxury packaging',
    price: 1299,
    originalPrice: 1699,
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Festive Gift Set' }
    ],
    category: 'gift-set',
    fragrance: 'mixed',
    weight: '600g (3 x 200g)',
    burnTime: '40-45 hours each',
    material: 'Soy Wax',
    tags: ['gift', 'festive', 'diwali', 'birthday', 'anniversary', 'set'],
    stock: 25,
    isFeatured: true,
    rating: 5.0,
    numReviews: 43,
  },
  {
    name: 'Sandalwood Serenity Candle',
    description: 'Deep, warm, and grounding. Our Sandalwood Serenity candle brings the essence of ancient forests into your home. Made with premium soy wax and pure sandalwood essential oil, this candle is perfect for meditation, yoga, or simply unwinding.',
    shortDescription: 'Grounding sandalwood soy candle for meditation',
    price: 579,
    originalPrice: 749,
    images: [
      { url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600', alt: 'Sandalwood Candle' }
    ],
    category: 'scented',
    fragrance: 'sandalwood',
    weight: '200g',
    burnTime: '42-48 hours',
    material: 'Soy Wax',
    tags: ['sandalwood', 'meditation', 'yoga', 'calming'],
    stock: 40,
    isFeatured: false,
    rating: 4.8,
    numReviews: 72,
  },
  {
    name: 'Jasmine Nights Candle',
    description: 'Capture the enchanting fragrance of jasmine in bloom under a moonlit sky. Our Jasmine Nights candle is hand-poured with jasmine essential oil and adorned with dried jasmine flowers. An irresistible fragrance for romantic evenings.',
    shortDescription: 'Romantic jasmine-scented soy candle',
    price: 529,
    originalPrice: 679,
    images: [
      { url: 'https://images.unsplash.com/photo-1618946625877-d02c7e9a2939?w=600', alt: 'Jasmine Candle' }
    ],
    category: 'scented',
    fragrance: 'jasmine',
    weight: '200g',
    burnTime: '40-44 hours',
    material: 'Soy Wax',
    tags: ['jasmine', 'romantic', 'floral', 'evening'],
    stock: 45,
    isFeatured: false,
    rating: 4.6,
    numReviews: 58,
  },
  {
    name: 'Diwali Festive Matka Set',
    description: 'Celebrate the festival of lights with our limited edition Diwali Matka Set. Two beautifully decorated clay matka candles filled with rose and sandalwood soy wax. Adorned with traditional motifs and packed in a premium gift box. Perfect for gifting!',
    shortDescription: 'Limited edition Diwali clay matka candle set',
    price: 999,
    originalPrice: 1299,
    images: [
      { url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600', alt: 'Diwali Matka Set' }
    ],
    category: 'festive',
    fragrance: 'rose & sandalwood',
    weight: '500g (2 x 250g)',
    burnTime: '45-50 hours each',
    material: 'Soy Wax in Clay Pots',
    tags: ['diwali', 'festive', 'matka', 'gift', 'traditional', 'limited edition'],
    stock: 15,
    isFeatured: true,
    rating: 4.9,
    numReviews: 31,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} sample products`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@rachvicreation.com' });
    if (!adminExists) {
      await User.create({
        name: 'Rachvi Admin',
        email: 'admin@rachvicreation.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 9876543210',
      });
      console.log('✅ Admin user created: admin@rachvicreation.com / Admin@123');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
