const mongoose = require("mongoose");

let connection;

const connectDB = async () => {
  if (!connection) {
    const url = process.env.MONGO_URI;
    if (!url) {
      throw new Error("MONGO_URI is not set in the environment variables.");
    }
    connection = await mongoose.connect(url);
    return connection;
  }
};

module.exports = connectDB;
