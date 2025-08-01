const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const LoginSession = require("../Model/LoginSession");
const OTP = require("../Model/OTP");
const { getIPInfo, checkMobileTimeRestriction, generateOTP, parseUserAgent } = require("../utils/loginTracking");
const { sendOTPEmail } = require("../utils/emailService");
const useragent = require("express-useragent");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Apply useragent middleware
router.use(useragent.express());

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    // Create free subscription for new user
    const Subscription = require("../Model/Subscription");
    const subscription = new Subscription({
      userId: user._id,
      planName: 'free',
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await subscription.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login with Enhanced Tracking
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Parse user agent
    const userAgentInfo = parseUserAgent(req.useragent);
    
    // Check mobile time restriction
    if (userAgentInfo.isMobile) {
      const timeCheck = checkMobileTimeRestriction();
      if (!timeCheck.allowed) {
        return res.status(403).json({ 
          message: timeCheck.message,
          currentTime: timeCheck.currentTime,
          currentDate: timeCheck.currentDate
        });
      }
    }

    // Check if Chrome browser and require OTP
    if (userAgentInfo.browser.toLowerCase().includes('chrome')) {
      // If OTP is provided, verify it
      if (otp) {
        const otpRecord = await OTP.findOne({ email: user.email, otp });
        if (!otpRecord) {
          return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });
      } else {
        // Generate and send OTP
        const otpCode = generateOTP();
        await OTP.create({ email: user.email, otp: otpCode });
        await sendOTPEmail(user.email, user.name, otpCode);
        
        return res.status(200).json({ 
          message: 'OTP sent to your email for Chrome verification',
          requiresOTP: true,
          email: user.email
        });
      }
    }

    // Generate token for successful login
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Track login session
    const ipInfo = await getIPInfo(req);
    await LoginSession.create({
      userId: user._id,
      ipAddress: ipInfo.ip,
      browser: userAgentInfo.browser,
      os: userAgentInfo.os,
      device: userAgentInfo.device,
      userAgent: req.headers['user-agent'],
      location: ipInfo.location
    });

    return res.json({ 
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email,
      requiresOTP: false
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, photo, idToken } = req.body;
    
    // Find existing user or create new one
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });
      await user.save();
      
      // Create free subscription for new user
      const Subscription = require("../Model/Subscription");
      const subscription = new Subscription({
        userId: user._id,
        planName: 'free',
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      await subscription.save();
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Track Google login session
    const ipInfo = await getIPInfo(req);
    const userAgentInfo = parseUserAgent(useragent.parse(req.headers['user-agent']));
    await LoginSession.create({
      userId: user._id,
      ipAddress: ipInfo.ip,
      browser: userAgentInfo.browser,
      os: userAgentInfo.os,
      device: userAgentInfo.device,
      userAgent: req.headers['user-agent'],
      location: ipInfo.location
    });
    
    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        photo: photo
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login (public endpoint)
router.post('/admin-login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Allow demo/dev login with hardcoded credentials
    if ((email === 'admin@example.com' || username === 'admin@example.com') && password === 'admin123') {
      const token = jwt.sign({ role: 'admin', email: 'admin@example.com', name: 'Admin' }, JWT_SECRET, { expiresIn: '7d' });
      
      // Track admin login session
      const ipInfo = await getIPInfo(req);
      const userAgentInfo = parseUserAgent(useragent.parse(req.headers['user-agent']));
      await LoginSession.create({
        userId: 'admin-demo', // Special ID for demo admin
        ipAddress: ipInfo.ip,
        browser: userAgentInfo.browser,
        os: userAgentInfo.os,
        device: userAgentInfo.device,
        userAgent: req.headers['user-agent'],
        location: ipInfo.location
      });
      
      return res.json({
        token,
        user: { email: 'admin@example.com', role: 'admin', name: 'Admin' }
      });
    }

    // Allow login by username OR email from DB
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username },
        { email: email }
      ],
      role: 'admin'
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Track admin login session
    const ipInfo = await getIPInfo(req);
    const userAgentInfo = parseUserAgent(useragent.parse(req.headers['user-agent']));
    await LoginSession.create({
      userId: user._id,
      ipAddress: ipInfo.ip,
      browser: userAgentInfo.browser,
      os: userAgentInfo.os,
      device: userAgentInfo.device,
      userAgent: req.headers['user-agent'],
      location: ipInfo.location
    });
    
    return res.json({
      token,
      user: { email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get Login History
router.get('/login-history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const loginSessions = await LoginSession.find({ userId: decoded.id })
      .sort({ loginTime: -1 })
      .limit(10);
    
    res.json(loginSessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper: Generate random password (A–Z, a–z, 8–12 chars)
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * 5) + 8; // 8–12
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // 1/day rule
    if (user.lastPasswordReset && Date.now() - user.lastPasswordReset.getTime() < 24 * 60 * 60 * 1000) {
      return res.status(429).json({ message: 'You can request password reset only once per day.' });
    }

    // Generate and hash new password
    const newPassword = generateRandomPassword();
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashed;
    user.lastPasswordReset = new Date();
    await user.save();

    // Send email (configure your SMTP in .env)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Your Password Reset',
      text: `Your new password is: ${newPassword}`,
    });

    res.json({ message: 'A new password has been sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Middleware to protect routes
function authMiddleware(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

// Export middleware for use in other routes
module.exports = { router, authMiddleware }; 