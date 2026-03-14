const mongoose = require("mongoose");

const url = process.env.MONGO_URI;
let connection;

const connectDB = async () => {
  if (!connection) {
    connection = await mongoose.connect(url);
    return connection;
  }
};

module.exports = connectDB;
