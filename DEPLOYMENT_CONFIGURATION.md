# Deployment Configuration Guide

## Overview
This guide explains how to configure your application for production deployment on Vercel (frontend) and Render (backend).

## 🔧 Backend CORS Configuration

### Current CORS Settings
The backend is configured to allow requests from:
- `http://localhost:3000` (local development)
- `https://intern-area-go6v.vercel.app` (existing Vercel deployment)

### How to Update CORS for Your Vercel Domain

1. **Get Your Vercel Domain**
   - After deploying to Vercel, you'll get a URL like: `https://your-app-name.vercel.app`
   - Or your custom domain if you set one up

2. **Update Backend CORS Settings**
   Edit `backend/index.js` and add your Vercel domain to the `allowedOrigins` array:

   ```javascript
   const allowedOrigins = [
     "http://localhost:3000",
     "https://intern-area-go6v.vercel.app",
     "https://your-app-name.vercel.app",  // Add your domain here
     "https://your-custom-domain.com"     // Add custom domain if any
   ];
   ```

3. **Redeploy Backend to Render**
   - Push the updated code to GitHub
   - Render will automatically redeploy

## 🔧 Frontend API Configuration

### Environment Variables Setup

1. **For Local Development**
   Create `.env.local` in the `internarea` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
   ```

2. **For Production (Vercel)**
   Set these environment variables in Vercel dashboard:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
   ```

## 📋 Step-by-Step Deployment Process

### Step 1: Deploy Backend to Render
1. Push your code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables:
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/internshala-clone?retryWrites=true&w=majority
   JWT_SECRET=your-production-jwt-secret
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   NODE_ENV=production
   ```
5. Deploy and get your Render URL (e.g., `https://your-backend-name.onrender.com`)

### Step 2: Update CORS Settings
1. Add your Vercel domain to `backend/index.js`:
   ```javascript
   const allowedOrigins = [
     "http://localhost:3000",
     "https://intern-area-go6v.vercel.app",
     "https://your-app-name.vercel.app"  // Your Vercel domain
   ];
   ```
2. Push changes to GitHub
3. Render will auto-redeploy

### Step 3: Deploy Frontend to Vercel
1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
   ```
4. Deploy

## 🔍 Testing Your Configuration

### Test Backend CORS
```bash
# Test from your local machine
curl -H "Origin: https://your-app-name.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-name.onrender.com/api/auth/login
```

### Test Frontend API Calls
1. Open your Vercel app
2. Try to register/login
3. Check browser console for CORS errors
4. Verify API calls are going to your Render backend

## 🚨 Common Issues & Solutions

### CORS Errors
- **Issue**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- **Solution**: Add your Vercel domain to `allowedOrigins` in backend

### API Connection Errors
- **Issue**: "Failed to fetch" or network errors
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel

### Environment Variables Not Working
- **Issue**: Frontend still using localhost API
- **Solution**: 
  1. Check Vercel environment variables are set
  2. Redeploy frontend after setting variables
  3. Clear browser cache

## 📊 Monitoring & Debugging

### Backend Logs (Render)
- Check Render logs for CORS messages
- Look for "✅ CORS allowed origin" or "🚫 CORS blocked origin"

### Frontend Debugging
- Open browser DevTools
- Check Network tab for API calls
- Look for CORS errors in Console

### Health Check
- Test backend health: `https://your-backend-name.onrender.com/health`
- Should return: `{"status":"ok","message":"Backend server is running"}`

## 🎯 Success Indicators
- ✅ Backend logs show "✅ CORS allowed origin" for your Vercel domain
- ✅ Frontend can successfully make API calls to backend
- ✅ User registration/login works from Vercel
- ✅ No CORS errors in browser console
- ✅ All features work as expected

## 📞 Troubleshooting Commands

```bash
# Test backend health
curl https://your-backend-name.onrender.com/health

# Test CORS preflight
curl -H "Origin: https://your-app-name.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend-name.onrender.com/api/auth/login

# Check environment variables in Vercel
# Go to Vercel dashboard → Your project → Settings → Environment Variables
``` 