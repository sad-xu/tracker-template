self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    const newHeaders = new Headers(event.request.headers);
    newHeaders.set('custom-header', 'pwa');
    const modifiedRequest = new Request(event.request, {
      headers: newHeaders,
    });
    event.respondWith(fetch(modifiedRequest));
  }
});
