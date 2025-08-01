require('dotenv').config();
const mongoose = require("mongoose");

const database = process.env.DATABASE_URL || "mongodb://localhost:27017/internshala-clone";

console.log("🧪 Testing MongoDB Atlas Connection...");
console.log("=====================================");

// Check if we're connecting to Atlas
const isAtlas = database.includes('mongodb+srv://') || database.includes('mongodb.net');

if (isAtlas) {
    console.log("☁️ Testing Atlas Connection");
    console.log("📊 Connection String:", database.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
} else {
    console.log("🏠 Testing Local Connection");
    console.log("📊 Connection String:", database);
}

// Connection options for Atlas
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: isAtlas,
    sslValidate: isAtlas,
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
};

mongoose.connect(database, connectionOptions)
.then(async () => {
    console.log("✅ Connection successful!");
    
    // Test database operations
    try {
        // Get database info
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log("📋 Available collections:");
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        // Test a simple query
        const User = require('./Model/User');
        const userCount = await User.countDocuments();
        console.log(`👥 Users in database: ${userCount}`);
        
        console.log("🎉 Atlas connection test completed successfully!");
        
    } catch (error) {
        console.log("⚠️ Connection successful but database operations failed:");
        console.log("   Error:", error.message);
    }
    
    process.exit(0);
})
.catch((err) => {
    console.error("❌ Connection failed!");
    console.error("Error:", err.message);
    
    if (isAtlas) {
        console.log("\n🔧 Atlas Troubleshooting:");
        console.log("1. Check if connection string is correct");
        console.log("2. Verify username and password");
        console.log("3. Check network access in Atlas dashboard");
        console.log("4. Ensure IP is whitelisted (or use 0.0.0.0/0)");
        console.log("5. Verify database user has correct permissions");
    } else {
        console.log("\n🔧 Local Troubleshooting:");
        console.log("1. Check if MongoDB is running locally");
        console.log("2. Verify connection string format");
        console.log("3. Check if database exists");
    }
    
    process.exit(1);
}); 