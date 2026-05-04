require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const products = [
  { name:'Rose Elysium', category:'floral', price:1299, originalPrice:1599, description:'Velvety rose petals with a hint of oud and warm musk. A timeless floral elegance that transforms any room into a luxurious sanctuary.', notes:['Rose','Oud','Musk'], badge:'Best Seller', wax:'Soy', burnTime:'45 hrs', images:[{url:'https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=600',public_id:'rose-elysium'}], rating:4.9, numReviews:128 },
  { name:'Sandalwood Noir', category:'woody', price:1499, description:'Dark sandalwood with smoky cedarwood and a whisper of black pepper. For those who prefer depth and mystery.', notes:['Sandalwood','Cedar','Black Pepper'], badge:'New', wax:'Soy', burnTime:'50 hrs', images:[{url:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',public_id:'sandalwood-noir'}], rating:4.8, numReviews:94 },
  { name:'Golden Bergamot', category:'citrus', price:1199, originalPrice:1399, description:'Sun-kissed bergamot with lemon zest and a base of green tea. A joyful morning ritual in a jar.', notes:['Bergamot','Lemon','Green Tea'], badge:'Sale', wax:'Coconut', burnTime:'40 hrs', images:[{url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',public_id:'golden-bergamot'}], rating:4.7, numReviews:76 },
  { name:'Midnight Spice', category:'festive', price:1699, description:'Cinnamon, clove and warm amber in perfect harmony. The quintessential festive evening fragrance.', notes:['Cinnamon','Clove','Amber'], badge:'Limited', wax:'Soy', burnTime:'50 hrs', images:[{url:'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600',public_id:'midnight-spice'}], rating:5.0, numReviews:211 },
  { name:'Lavender Dusk', category:'floral', price:1099, description:'Soft lavender with chamomile and vanilla. Your bedtime companion for peaceful, restorative sleep.', notes:['Lavender','Chamomile','Vanilla'], wax:'Soy', burnTime:'45 hrs', images:[{url:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600',public_id:'lavender-dusk'}], rating:4.9, numReviews:183 },
  { name:'Amber Oud', category:'woody', price:1899, originalPrice:2199, description:'Rich amber resin with royal oud and a hint of vanilla. A statement of opulence and refinement.', notes:['Amber','Oud','Vanilla'], badge:'Luxury', wax:'Soy', burnTime:'55 hrs', images:[{url:'https://images.unsplash.com/photo-1574259392081-cbf174cb4416?w=600',public_id:'amber-oud'}], rating:4.8, numReviews:67 },
  { name:'Sicilian Lemon', category:'citrus', price:999, description:'Zesty Sicilian lemon groves with a touch of white tea and fresh mint. Pure Mediterranean sunshine.', notes:['Lemon','White Tea','Mint'], wax:'Coconut', burnTime:'38 hrs', images:[{url:'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600',public_id:'sicilian-lemon'}], rating:4.6, numReviews:52 },
  { name:'Winter Ember', category:'festive', price:1599, description:'A warm fireside blend of pine, cinnamon and cozy vanilla smoke. Winter evenings perfected.', notes:['Pine','Cinnamon','Vanilla Smoke'], badge:'New', wax:'Soy', burnTime:'48 hrs', images:[{url:'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600',public_id:'winter-ember'}], rating:4.9, numReviews:88 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✦ Connected to MongoDB');

  await User.deleteMany();
  await Product.deleteMany();

  // Admin user
  await User.create({ name:'Veloura Admin', email:'admin@veloura.com', password:'Admin@123', role:'admin' });
  console.log('✦ Admin created: admin@veloura.com / Admin@123');

  // Products
  await Product.insertMany(products);
  console.log(`✦ ${products.length} products seeded`);

  console.log('✦ Seed complete!');
  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
