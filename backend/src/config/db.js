// MongoDB connection setup using Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set. Add it to the service environment variables.');
    process.exit(1);
  }

  if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
    console.error(
      '❌ MONGODB_URI must be the complete Atlas connection string and start with mongodb:// or mongodb+srv://. Do not include MONGODB_URI= or surrounding quotes in the value.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
