# MongoDB Atlas Migration Guide

## Overview
This guide helps you migrate from MongoDB Compass (local) to MongoDB Atlas (cloud) for deployment on Vercel (frontend) and Render (backend).

## ✅ Completed Updates

### 1. Database Configuration (`backend/db.js`)
- ✅ Added Atlas-specific connection options
- ✅ SSL configuration for Atlas
- ✅ Connection pooling for better performance
- ✅ Improved error handling and logging
- ✅ Automatic detection of Atlas vs Local connection

### 2. Environment Template (`backend/env-template.txt`)
- ✅ Updated with Atlas connection string format
- ✅ Added deployment notes and setup instructions
- ✅ Clear documentation for both local and production

### 3. Test Script (`backend/test-atlas-connection.js`)
- ✅ Created comprehensive connection test
- ✅ Database operation verification
- ✅ Troubleshooting guidance

## 🔧 Next Steps

### Step 1: Test Atlas Connection
```bash
cd backend
node test-atlas-connection.js
```

### Step 2: Update Environment Variables
Create/update your `.env` file in the backend directory:

```env
# For Atlas (Production)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/internshala-clone?retryWrites=true&w=majority

# Other required variables
JWT_SECRET=your-production-jwt-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NODE_ENV=production
```

### Step 3: Data Migration
1. **Export from Local MongoDB:**
   ```bash
   # Export all collections
   mongoexport --db internshala-clone --collection users --out users.json
   mongoexport --db internshala-clone --collection jobs --out jobs.json
   # ... repeat for other collections
   ```

2. **Import to Atlas:**
   - Use MongoDB Atlas Data Explorer
   - Or use `mongoimport` command
   - Verify data integrity

### Step 4: Deploy Backend to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy

### Step 5: Update Frontend for Production
1. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
2. Deploy to Vercel
3. Set environment variables in Vercel dashboard

## 🚨 Important Notes

### Atlas Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

### Atlas Setup Checklist
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (free tier available)
- [ ] Create database user with read/write permissions
- [ ] Configure network access (IP whitelist or 0.0.0.0/0)
- [ ] Get connection string from Atlas dashboard
- [ ] Test connection locally
- [ ] Migrate data from local MongoDB

### Environment Variables for Render
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/internshala-clone?retryWrites=true&w=majority
JWT_SECRET=your-production-jwt-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NODE_ENV=production
PORT=10000
```

### Environment Variables for Vercel
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

## 🔍 Troubleshooting

### Common Atlas Connection Issues
1. **Authentication failed**: Check username/password
2. **Network access denied**: Configure IP whitelist in Atlas
3. **SSL errors**: Atlas requires SSL (already configured)
4. **Connection timeout**: Check network connectivity

### Testing Commands
```bash
# Test Atlas connection
node test-atlas-connection.js

# Test local server
npm start

# Check environment variables
echo $DATABASE_URL
```

## 📋 Deployment Checklist

### Backend (Render)
- [ ] Atlas connection working
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Email functionality working
- [ ] Payment integration working
- [ ] Socket.IO working
- [ ] Environment variables set correctly

### Frontend (Vercel)
- [ ] API communication working
- [ ] Authentication flow working
- [ ] Payment integration working
- [ ] Environment variables set correctly

## 🎯 Success Indicators
- ✅ Database connection logs show "☁️ Connected to MongoDB Atlas"
- ✅ All API endpoints return expected responses
- ✅ User registration/login works
- ✅ Email notifications are sent
- ✅ Payment processing works
- ✅ Real-time features (Socket.IO) work

## 📞 Support
If you encounter issues:
1. Check the test script output
2. Verify Atlas configuration
3. Check Render/Vercel logs
4. Ensure all environment variables are set correctly 