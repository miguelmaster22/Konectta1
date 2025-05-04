const mongoose = require('mongoose');

const env = process.env
const uriMongoDB = env.APP_URIMONGODB + env.APP_NAME + "?retryWrites=true&w=majority"

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uriMongoDB);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1); // Detener el servidor si hay error
  }
};

module.exports = connectDB;