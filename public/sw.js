// Service Worker for Brahmin Soulmate Connect
// Handles push notifications and offline functionality

const CACHE_NAME = 'brahmin-soulmate-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/badge-72x72.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: data.data,
      actions: data.actions || [],
      tag: data.tag,
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Handle different actions
  if (event.action === 'reply') {
    targetUrl = `/messages?conversation=${data.conversationId}`;
  } else if (event.action === 'view') {
    targetUrl = data.url || '/messages';
  } else if (event.action === 'view_profile') {
    targetUrl = `/profile/${data.profileId}`;
  } else if (event.action === 'respond') {
    targetUrl = '/interests-received';
  } else {
    // Default action - use URL from data or fallback
    targetUrl = data.url || '/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Background sync for offline message sending
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(
      // Handle background sync for messages
      syncMessages()
    );
  }
});

// Function to sync messages when back online
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = await getPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        // Attempt to send message
        await sendMessage(message);
        // Remove from pending if successful
        await removePendingMessage(message.id);
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for message sync
async function getPendingMessages() {
  // Implementation would depend on your storage strategy
  return [];
}

async function sendMessage(message) {
  // Implementation would make API call to send message
  return fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  });
}

async function removePendingMessage(messageId) {
  // Implementation would remove message from local storage
  console.log('Removing pending message:', messageId);
}

// Handle notification close event
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification dismissal for analytics
  if (event.notification.data && event.notification.data.trackDismissal) {
    // Send analytics event
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Failed to track notification dismissal:', error);
    });
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', function(event) {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('Service Worker loaded successfully');