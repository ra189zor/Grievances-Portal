self.addEventListener('push', function(event) {
  const options = event.data.json();
  event.waitUntil(
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: '/heart-icon.png',
      badge: '/notification-badge.png',
      actions: [
        { action: 'view', title: 'View Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: options.data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'view' && event.notification.data?.grievanceId) {
    const urlToOpen = new URL(`/grievance/${event.notification.data.grievanceId}`, self.location.origin);
    event.waitUntil(
      clients.openWindow(urlToOpen.href)
    );
  }
});
