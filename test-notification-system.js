// Test script for notification system
// Run this in the browser console on the userapplication page

console.log('🧪 Testing Notification System...');

// Test 1: Check if Notification API is supported
console.log('📱 Notification API supported:', 'Notification' in window);

// Test 2: Check current permission
console.log('🔐 Current permission:', Notification.permission);

// Test 3: Test socket connection (if on userapplication page)
if (typeof io !== 'undefined') {
  console.log('🔌 Socket.io available');
  
  // Test socket connection
  const testSocket = io('http://localhost:5000', {
    transports: ["websocket"],
    withCredentials: true
  });
  
  testSocket.on('connect', () => {
    console.log('✅ Socket connected successfully');
    testSocket.disconnect();
  });
  
  testSocket.on('connect_error', (error) => {
    console.error('❌ Socket connection failed:', error);
  });
} else {
  console.log('⚠️ Socket.io not available (not on userapplication page)');
}

// Test 4: Test notification function
function testNotification() {
  if (Notification.permission === 'granted') {
    new Notification('🧪 Test Notification', {
      body: 'This is a test notification from the notification system',
      icon: '/logo.png'
    });
    console.log('✅ Test notification sent');
  } else {
    console.log('❌ Cannot send test notification - permission not granted');
  }
}

// Test 5: Check localStorage for notification preference
console.log('💾 Notification enabled in localStorage:', localStorage.getItem('notificationEnabled'));

// Test 6: Simulate application status change event
function simulateStatusChange() {
  if (typeof io !== 'undefined') {
    const testSocket = io('http://localhost:5000', {
      transports: ["websocket"],
      withCredentials: true
    });
    
    testSocket.on('connect', () => {
      console.log('✅ Test socket connected for simulation');
      
      // Simulate the event that would be emitted from backend
      setTimeout(() => {
        testSocket.emit('application-status-changed', {
          email: 'test@example.com',
          status: 'accepted',
          title: 'Test Job Position'
        });
        console.log('🎭 Simulated application-status-changed event');
        testSocket.disconnect();
      }, 1000);
    });
  } else {
    console.log('⚠️ Cannot simulate - Socket.io not available');
  }
}

console.log('🧪 Test complete!');
console.log('Run testNotification() to test browser notifications');
console.log('Run simulateStatusChange() to simulate backend event'); 