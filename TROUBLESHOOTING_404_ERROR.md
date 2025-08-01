# 🔧 404 Error Troubleshooting Guide

## 🚨 Current Issue
You're getting a 404 error when trying to fetch data from `/api/internship` and `/api/job` endpoints.

## 🔍 Step-by-Step Debugging

### Step 1: Check Backend Server Status

**Option A: Using the debugger component**
1. The debugger component is now added to your homepage
2. Open your frontend in the browser
3. Look for the debugger panel in the top-right corner
4. It will show you the status of all API endpoints

**Option B: Manual testing**
```bash
# Test if backend is running
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Backend server is running"
}
```

### Step 2: Start Backend Server (if not running)

```bash
cd backend
npm start
```

**Expected output:**
```
🚀 Starting server...
🔗 Initializing database connection...
✅ Database connection initiated successfully
✅ Server is running on port 5000
🌐 Health check: http://localhost:5000/health
🔌 Socket.IO server is ready
🌍 CORS enabled for: http://localhost:3000, https://internshala-weld.vercel.app
```

### Step 3: Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test internship endpoint
curl http://localhost:5000/api/internship

# Test job endpoint
curl http://localhost:5000/api/job
```

### Step 4: Check Frontend Environment

**Create `.env.local` in the `internarea` directory:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Or check current environment:**
```bash
# In frontend directory
echo $NEXT_PUBLIC_API_URL
```

## 🚨 Common Issues & Solutions

### Issue 1: Backend Server Not Running
**Symptoms:** Connection refused, Network Error
**Solution:** Start the backend server
```bash
cd backend
npm start
```

### Issue 2: Wrong API URL
**Symptoms:** 404 errors, wrong server responses
**Solution:** Check environment variables
```bash
# Frontend
echo $NEXT_PUBLIC_API_URL

# Should be: http://localhost:5000 (for local development)
```

### Issue 3: Database Connection Issues
**Symptoms:** Backend starts but API returns errors
**Solution:** Check database connection
```bash
cd backend
node test-atlas-connection.js
```

### Issue 4: CORS Issues
**Symptoms:** CORS errors in browser console
**Solution:** Check CORS configuration in `backend/index.js`

## 📊 Debugging Tools Added

### 1. API Debugger Component
- Added to your homepage
- Shows real-time API endpoint status
- Displays connection errors
- Located in top-right corner

### 2. Enhanced Error Logging
- Detailed console logs for API calls
- Error details with status codes
- URL information for debugging

### 3. Environment Debugging
- Check environment variables
- Verify API URL configuration
- Debug environment issues

## 🔧 Quick Fixes

### If Backend is Not Running:
```bash
cd backend
npm start
```

### If API URL is Wrong:
Create/update `.env.local` in `internarea` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### If Database is Empty:
```bash
cd backend
node test-atlas-connection.js
```

### If CORS Issues:
Check `backend/index.js` CORS configuration.

## 📋 Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Health endpoint responds correctly
- [ ] API endpoints return data (even if empty)
- [ ] Frontend API_URL is set to `http://localhost:5000`
- [ ] No CORS errors in browser console
- [ ] Database connection is working
- [ ] Debugger component shows green status

## 🎯 Expected Behavior

### Backend Running:
```
✅ Server is running on port 5000
✅ Database connection initiated successfully
✅ Health check: http://localhost:5000/health
```

### Frontend Working:
```
✅ Debugger shows all endpoints as green
✅ No 404 errors in console
✅ Data loads on homepage
```

## 📞 Next Steps

1. **Start backend server** if not running
2. **Check debugger component** on homepage
3. **Verify environment variables** are set correctly
4. **Test endpoints manually** using curl
5. **Check browser console** for detailed error messages

## 🚨 Emergency Fixes

### If Nothing Works:
1. **Restart backend server**
2. **Clear browser cache**
3. **Check if port 5000 is available**
4. **Verify no other services are using port 5000**

### If Still Getting 404:
1. **Check if routes are properly configured**
2. **Verify database has data**
3. **Check if middleware is blocking requests**

## 📞 Support Commands

```bash
# Test backend health
curl http://localhost:5000/health

# Test specific endpoints
curl http://localhost:5000/api/internship
curl http://localhost:5000/api/job

# Check environment
echo $NEXT_PUBLIC_API_URL

# Test database
cd backend && node test-atlas-connection.js
```

## 🎯 Success Indicators

- ✅ Backend responds to health check
- ✅ API endpoints return data (even empty arrays)
- ✅ Frontend loads without errors
- ✅ Debugger component shows all green
- ✅ No 404 errors in browser console
- ✅ Data displays on homepage 