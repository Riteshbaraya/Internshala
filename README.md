# 🎯 Intern Area - Full-Stack Job & Internship Portal

A modern, real-time job and internship portal built with Next.js and Node.js, featuring real-time notifications, admin panel, user management, and seamless application tracking.

![Intern Area](https://img.shields.io/badge/Next.js-15.2.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-orange?style=for-the-badge&logo=socket.io)

## 📦 Project Overview

Intern Area is a comprehensive job and internship portal that connects job seekers with opportunities. The platform features separate admin and user panels with real-time notifications, application tracking, and modern UI/UX.

### ✨ Main Features

- **👥 Dual Panel System**: Separate admin and user interfaces
- **📝 Job/Internship Management**: Create, edit, and manage opportunities
- **📋 Application Tracking**: Real-time status updates and tracking
- **🔔 Real-time Notifications**: WebSocket-powered browser notifications
- **💳 Payment Integration**: Razorpay payment gateway for subscriptions
- **📧 Email Notifications**: SMTP-based email system
- **🌍 Location Services**: Google Maps and weather integration
- **🔐 Authentication**: JWT-based secure authentication
- **📊 Analytics Dashboard**: Admin statistics and insights

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.1
- **Language**: TypeScript
- **UI Library**: React 19.0.0
- **Styling**: TailwindCSS 4
- **State Management**: Redux Toolkit
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Maps**: Google Maps API
- **Carousel**: Swiper

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Payments**: Razorpay
- **Security**: bcryptjs, CORS
- **Utilities**: moment-timezone, uuid

### Database
- **Primary**: MongoDB Atlas
- **ODM**: Mongoose

### Real-time Communication
- **WebSocket**: Socket.IO (v4.8.1)
- **Transport**: WebSocket only
- **CORS**: Configured for localhost:3000

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🛠️ Environment Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Google Maps API key (optional)
- Weather API key (optional)
- Razorpay account (for payments)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd internshala-clone-main
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Install dependencies
```bash
npm install
```

#### Create `.env` file
```bash
# Database
MONGO_URI=your_mongodb_atlas_connection_string
DATABASE_URL=your_mongodb_atlas_connection_string

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email (Gmail)
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

# Razorpay (Payments)
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# IP Geolocation (Optional)
IP_API_KEY=your_ipinfo_api_key
```

#### Start backend server
```bash
npm start
# or for development with nodemon
npm run dev
```

### 3. Frontend Setup

#### Navigate to frontend directory
```bash
cd internarea
```

#### Install dependencies
```bash
npm install
```

#### Create `.env.local` file
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key_id

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Weather API (Optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

#### Start frontend development server
```bash
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔔 Real-Time Notification System

### How It Works

The notification system uses WebSocket technology to provide instant, real-time updates to users when their application status changes.

#### 🔧 Technical Implementation

**Backend (Socket.IO Server)**
```javascript
// Socket connection setup
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  }
});

// User joins their email room
socket.on("join", (email) => {
  socket.join(email);
});

// Emit notification when admin updates application
io.to(userEmail).emit('application-status-changed', {
  email: userEmail,
  status: status, // 'accepted' or 'rejected'
  title: jobTitle
});
```

**Frontend (Socket.IO Client)**
```typescript
// Connect to WebSocket server
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

// Join user room
socket.emit("join", user.email);

// Listen for status changes
socket.on("application-status-changed", (data) => {
  if (Notification.permission === "granted" && notificationEnabled) {
    const title = data.status === "accepted" ? "🎉 You're Hired!" : "❌ Application Rejected";
    const body = `Status: ${data.status.toUpperCase()} for ${data.title}`;
    showNotification(title, body);
  }
});
```

### 🎯 Notification Features

- **🎨 Custom Titles**: 
  - Accepted: "🎉 You're Hired!" (Green background)
  - Rejected: "❌ Application Rejected" (Blue background)
- **📱 Browser Native**: Uses browser's Notification API
- **🎯 Targeted**: Only sent to specific user
- **⚡ Real-time**: No polling, instant delivery
- **🔐 Permission-based**: Respects browser and user preferences
- **🖱️ Clickable**: Click notification to navigate to applications page

### 👤 User Control

Users can enable/disable notifications from their profile page:

1. **Navigate to Profile**: Go to `/profile`
2. **Toggle Switch**: Use the notification toggle
3. **Browser Permission**: Grant notification permission when prompted
4. **Preference Storage**: Settings saved to localStorage and database

### 🚫 When Notifications Don't Show

- User has disabled notifications in profile
- Browser permission is denied
- User is on admin panel (notifications only for user panel)
- Browser doesn't support notifications

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)

#### 1. Prepare for Deployment
```bash
cd internarea
npm run build
```

#### 2. Deploy to Vercel
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### 3. Environment Variables (Vercel)
Add these in Vercel dashboard:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

### Backend Deployment (Render)

#### 1. Prepare for Deployment
```bash
cd backend
# Ensure package.json has correct start script
```

#### 2. Deploy to Render
1. **Create New Web Service**: Connect your GitHub repo
2. **Configure Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

#### 3. Environment Variables (Render)
Add these in Render dashboard:
```bash
MONGO_URI=your_mongodb_atlas_connection_string
DATABASE_URL=your_mongodb_atlas_connection_string
PORT=10000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
IP_API_KEY=your_ipinfo_api_key
```

#### 4. Update Frontend API URL
After backend deployment, update your frontend's `NEXT_PUBLIC_API_URL` to point to your Render backend URL.

### Database Setup (MongoDB Atlas)

1. **Create Cluster**: Set up MongoDB Atlas cluster
2. **Network Access**: Add `0.0.0.0/0` for global access
3. **Database User**: Create user with read/write permissions
4. **Connection String**: Use the provided connection string in your environment variables

## 👤 Admin Credentials (Demo)

For testing purposes, you can create an admin user using the provided script:

```bash
cd backend
node createAdminUser.js
```

**Default Admin Credentials:**
- **Email**: admin@internarea.com
- **Password**: admin123
- **Role**: admin

⚠️ **Important**: Change these credentials in production!

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400/2563eb/ffffff?text=Admin+Dashboard)

### User Application Page
![User Applications](https://via.placeholder.com/800x400/059669/ffffff?text=User+Applications)

### Real-time Notification
![Notification Example](https://via.placeholder.com/400x200/f59e0b/ffffff?text=Real-time+Notification)

## 🧪 Testing

### Test Notification System
1. **Open Browser Console**: On userapplication page
2. **Run Test Script**: Copy and paste the content from `test-notification-system.js`
3. **Verify Components**: Check socket connection, permissions, and notifications

### Manual Testing Flow
1. **User Login**: Login as a regular user
2. **Enable Notifications**: Go to profile and enable notifications
3. **Grant Permission**: Allow browser notifications
4. **Admin Login**: Login as admin in another tab
5. **Update Application**: Change application status
6. **Check Notification**: Verify real-time notification appears

## 🐛 Troubleshooting

### Common Issues

**Backend Won't Start**
- Check MongoDB connection string
- Verify all environment variables are set
- Ensure port 5000 is available

**Frontend Build Fails**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check TypeScript errors

**Socket Connection Fails**
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure WebSocket transport is enabled

**Notifications Not Working**
- Check browser permission status
- Verify user has enabled notifications in profile
- Ensure user is on user panel (not admin)

### Debug Commands

```bash
# Check backend health
curl http://localhost:5000/health

# Test socket connection
# Run test-notification-system.js in browser console

# Check environment variables
echo $MONGO_URI
echo $JWT_SECRET
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/forgot-password` - Password reset

### Application Endpoints
- `GET /api/application` - Get all applications (admin)
- `POST /api/application` - Submit application (user)
- `PUT /api/application/:id` - Update application status (admin)
- `GET /api/application/user/:identifier` - Get user applications

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile/notification` - Update notification preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using Next.js, Node.js, and Socket.IO** 