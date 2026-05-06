import mongoose from "mongoose";

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  const url = process.env.MONGO_URI;
  if (!url) throw new Error("MONGO_URI is not set in environment variables.");

  if (!cached.promise) {
    cached.promise = mongoose.connect(url).then(async (m) => {
      // Drop legacy unique index on email if it exists
      try {
        await m.connection.collection("volunteers").dropIndex("email_1");
      } catch {
        /* index doesn't exist, ignore */
      }
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
