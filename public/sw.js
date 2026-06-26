self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'AutoPOS Уведомление', message: event.data.text() };
    }
  }

  const title = data.title || 'Новое уведомление';
  const options = {
    body: data.message || 'Проверьте приложение.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
