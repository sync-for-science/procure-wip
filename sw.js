//see: https://github.com/facebook/create-react-app/issues/5673

if ('function' === typeof importScripts) {
	importScripts(
		'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
	);

	/* global workbox */
	if (workbox) {
		console.log('Workbox is loaded');

		/* injection point for manifest files.  */
		workbox.precaching.precacheAndRoute([
  {
    "url": "app.css",
    "revision": "57a2c1bf9784a57faf146bce76df6707"
  },
  {
    "url": "bootstrap.min.css",
    "revision": "a15c2ac3234aa8f6064ef9c1f7383c37"
  },
  {
    "url": "callback.html",
    "revision": "258c8c04ce3561d10efc8298a98ed60d"
  },
  {
    "url": "index.html",
    "revision": "1acfd87ffce0eab57cea2f63409dde3f"
  },
  {
    "url": "precache-manifest.58237766ad0feae6d415c13398b7968e.js",
    "revision": "58237766ad0feae6d415c13398b7968e"
  },
  {
    "url": "service-worker.js",
    "revision": "7dc623357a702e138030f21e3399763b"
  },
  {
    "url": "static/js/2.78dbfbdc.chunk.js",
    "revision": "80c7302642872a19645a785e99891d6b"
  },
  {
    "url": "static/js/main.1cadce13.chunk.js",
    "revision": "11ea43c49771b330725eae22879b0f5a"
  },
  {
    "url": "static/js/runtime-main.73bea312.js",
    "revision": "6d37d0162427e94e36fc02fe7e89b072"
  }
]);

		/* custom cache rules*/
		workbox.routing.registerNavigationRoute('/index.html', {
			blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
		});

		workbox.routing.registerNavigationRoute('/callback.html');

		workbox.routing.registerRoute(
			/\.(?:png|gif|jpg|jpeg)$/,
			workbox.strategies.cacheFirst({
				cacheName: 'images',
				plugins: [
					new workbox.expiration.Plugin({
						maxEntries: 60,
						maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
					}),
				],
			})
		);

	} else {
		console.log('Workbox could not be loaded. No Offline support');
	}
}