// Simple helper function for showing notifications
export function showNotification(title: string, body: string) {
  console.log("🔔 showNotification called with:", { title, body });
  
  if (!('Notification' in window)) {
    console.warn('❌ Browser does not support notifications');
    return;
  }
  
  if (Notification.permission !== "granted") {
    console.warn('❌ Notification permission not granted');
    return;
  }

  try {
    console.log("✅ Creating notification...");
    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `application-${Date.now()}`,
      requireInteraction: false,
      silent: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
      console.log("🔔 Notification auto-closed");
    }, 5000);

    // Handle click to focus window and navigate
    notification.onclick = () => {
      console.log("🔔 Notification clicked, navigating to applications");
      window.focus();
      notification.close();
      window.location.href = "/userapplication";
    };

    console.log('✅ Notification shown successfully:', { title, body });
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
} 