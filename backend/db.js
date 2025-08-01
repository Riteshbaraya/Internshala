const mongoose = require("mongoose");
require('dotenv').config();

const database = process.env.DATABASE_URL || "mongodb://localhost:27017/internshala-clone";

module.exports.connect = () => {
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log("📊 Database URL:", database);
    
    mongoose.connect(database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("✅ Database is connected successfully");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        console.log("💡 Please check:");
        console.log("   1. MongoDB is running on your system");
        console.log("   2. Create a .env file with DATABASE_URL");
        console.log("   3. Or use default: mongodb://localhost:27017/internshala-clone");
    });
};
