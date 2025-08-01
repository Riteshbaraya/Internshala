# API Debugging Guide - 404 Error Resolution

## 🚨 Issue: 404 Error on API Calls

You're getting a 404 error when trying to fetch data from `/api/internship` and `/api/job` endpoints.

## 🔍 Root Cause Analysis

### 1. **Backend Server Status**
First, check if your backend server is running:

```bash
# Check if backend is running
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Backend server is running"
}
```

### 2. **API Endpoints Verification**
Test the specific endpoints that are failing:

```bash
# Test internship endpoint
curl http://localhost:5000/api/internship

# Test job endpoint
curl http://localhost:5000/api/job
```

### 3. **Frontend API URL Configuration**
Check your frontend environment variables:

**For Local Development:**
Create `.env.local` in the `internarea` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**For Production (Vercel):**
Set in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

## 🔧 Step-by-Step Resolution

### Step 1: Verify Backend Server
```bash
cd backend
npm start
```

Check console output for:
- ✅ Server is running on port 5000
- ✅ Database connection successful
- ✅ CORS enabled for: http://localhost:3000

### Step 2: Test API Endpoints
```bash
cd backend
node test-api-endpoints.js
```

This will test all endpoints and show which ones are working.

### Step 3: Check Database Connection
```bash
cd backend
node test-atlas-connection.js
```

Ensure your Atlas database is connected and has data.

### Step 4: Verify Frontend Configuration
Check `internarea/src/utils/config.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

## 🚨 Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptoms:** All API calls return 404
**Solution:** Start the backend server
```bash
cd backend
npm start
```

### Issue 2: Wrong API URL
**Symptoms:** Network errors or wrong server responses
**Solution:** Check environment variables
```bash
# In frontend directory
echo $NEXT_PUBLIC_API_URL
```

### Issue 3: CORS Issues
**Symptoms:** CORS errors in browser console
**Solution:** Check CORS configuration in `backend/index.js`

### Issue 4: Database Empty
**Symptoms:** API returns empty arrays
**Solution:** Add sample data to database

## 📊 Debugging Commands

### Test Backend Health
```bash
curl http://localhost:5000/health
```

### Test Specific Endpoints
```bash
curl http://localhost:5000/api/internship
curl http://localhost:5000/api/job
```

### Check Environment Variables
```bash
# Frontend
echo $NEXT_PUBLIC_API_URL

# Backend
echo $DATABASE_URL
```

### Test Database Connection
```bash
cd backend
node test-atlas-connection.js
```

## 🎯 Expected Behavior

### Backend Running Locally
- Server starts on port 5000
- Database connects successfully
- Health endpoint responds
- API endpoints return data

### Frontend Configuration
- API_URL points to correct backend
- No CORS errors in browser
- Data loads successfully

## 📋 Checklist

- [ ] Backend server is running
- [ ] Database is connected
- [ ] API endpoints are accessible
- [ ] Frontend API_URL is correct
- [ ] CORS is configured properly
- [ ] Environment variables are set
- [ ] No network errors in browser console

## 🔧 Quick Fixes

### If Backend is Not Running:
```bash
cd backend
npm start
```

### If API URL is Wrong:
Update `.env.local` in frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### If Database is Empty:
Add sample data or check Atlas connection.

### If CORS Issues:
Check `backend/index.js` CORS configuration.

## 📞 Next Steps

1. **Run the test script** to identify the exact issue
2. **Check backend logs** for error messages
3. **Verify environment variables** are set correctly
4. **Test endpoints manually** using curl
5. **Check browser console** for detailed error messages

## 🎯 Success Indicators

- ✅ Backend responds to health check
- ✅ API endpoints return data
- ✅ Frontend loads without errors
- ✅ No 404 errors in browser console
- ✅ Data displays on homepage 