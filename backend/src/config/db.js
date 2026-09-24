import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded regardless of current working directory
dotenv.config();
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB connection URI is missing! Please configure MONGODB_URI or MONGO_URI in your environment variables.'
      );
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully (${conn.connection.host}/${conn.connection.name})`);

    // Drop legacy non-sparse orderNumber_1 index if it exists
    try {
      const ordersColl = conn.connection.collection('orders');
      const indexes = await ordersColl.indexes();
      const legacyIndex = indexes.find((idx) => idx.name === 'orderNumber_1' && !idx.sparse);
      if (legacyIndex) {
        await ordersColl.dropIndex('orderNumber_1');
        console.log('Cleared legacy non-sparse orderNumber_1 index');
      }
    } catch (err) {
      // Ignore index drop errors on clean setups
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
