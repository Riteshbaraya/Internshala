const mongoose = require("mongoose");
require('dotenv').config();

const database = process.env.DATABASE_URL || "mongodb://localhost:27017/internshala-clone";

module.exports.connect = () => {
    console.log("🔗 Attempting to connect to MongoDB...");
    
    // Check if we're connecting to Atlas (cloud) or local MongoDB
    const isAtlas = database.includes('mongodb+srv://') || database.includes('mongodb.net');
    
    if (isAtlas) {
        console.log("☁️ Connecting to MongoDB Atlas (Cloud Database)");
    } else {
        console.log("🏠 Connecting to Local MongoDB");
    }
    
    // Connection options optimized for Atlas
    const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Atlas-specific options
        ssl: isAtlas,
        sslValidate: isAtlas,
        retryWrites: true,
        w: 'majority',
        // Connection pool settings for better performance
        maxPoolSize: 10,
        minPoolSize: 2,
        // Timeout settings
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Keep connection alive
        keepAlive: true,
        keepAliveInitialDelay: 300000,
    };

    mongoose.connect(database, connectionOptions)
    .then(() => {
        console.log("✅ Database is connected successfully");
        if (isAtlas) {
            console.log("☁️ Connected to MongoDB Atlas");
        } else {
            console.log("🏠 Connected to Local MongoDB");
        }
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        console.log("💡 Please check:");
        
        if (isAtlas) {
            console.log("   1. Atlas connection string is correct");
            console.log("   2. Network access is configured in Atlas");
            console.log("   3. Database user has correct permissions");
            console.log("   4. IP address is whitelisted in Atlas");
        } else {
            console.log("   1. MongoDB is running on your system");
            console.log("   2. Create a .env file with DATABASE_URL");
            console.log("   3. Or use default: mongodb://localhost:27017/internshala-clone");
        }
        
        console.log("🔧 Connection string format:");
        console.log("   Local: mongodb://localhost:27017/database-name");
        console.log("   Atlas: mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority");
    });
};
