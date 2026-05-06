import mongoose from "mongoose";

// global caching pattern for Next.js to avoid opening
// multiple connections during hot reload
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI is not set in environment variables.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(url).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
