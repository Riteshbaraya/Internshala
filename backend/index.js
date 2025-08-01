require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyparser = require("body-parser");
const { connect } = require("./db");
const router = require("./Routes/index");
const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = require('http').createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://intern-area-go6v.vercel.app"
];

// Configure socket.io with CORS for multiple origins
const io = require('socket.io')(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

// Make io available to routes
app.set('io', io);

// Handle user room joins
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("join", (email) => {
    socket.join(email);
    console.log(`User ${email} joined room, Socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// CORS configuration for Express middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("hello this is internshala backend");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Backend server is running"
  });
});

app.use("/api", router);

// Connect to database (but don't block server startup)
try {
  connect();
} catch (error) {
  console.log("⚠️ Database connection failed, but server will continue running");
  console.log("💡 Some features may not work without database connection");
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server with Socket.IO
httpServer.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`🔌 Socket.IO server is ready`);
  console.log(`🌍 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
