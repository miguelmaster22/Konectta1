const mongoose = require('mongoose');

const env = process.env
const uriMongoDB_nonce = env.APP_URIMONGODB +"nonce-v1?authSource=admin&retryWrites=true&w=majority"
const uriMongoDB = env.APP_URIMONGODB + env.APP_NAME + "?authSource=admin&retryWrites=true&w=majority"


const db1 = mongoose.createConnection(uriMongoDB_nonce)
const db2 = mongoose.createConnection(uriMongoDB)


module.exports = { db1, db2 };