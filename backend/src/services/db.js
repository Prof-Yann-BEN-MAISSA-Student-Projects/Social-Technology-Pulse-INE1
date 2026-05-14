import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    console.warn('[db] Running without persistence — in-memory only');
  }
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}
