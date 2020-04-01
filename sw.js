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
    "revision": "58ef34fcc6758fe82ad875ad058c2173"
  },
  {
    "url": "precache-manifest.148e3a7672330886ac08dc566161cd4b.js",
    "revision": "148e3a7672330886ac08dc566161cd4b"
  },
  {
    "url": "service-worker.js",
    "revision": "faf3a6491a8f574230d53c6df6ce0d3b"
  },
  {
    "url": "static/js/2.8fdeea1c.chunk.js",
    "revision": "f7ff126bf0b4b841e01032445bea9fc6"
  },
  {
    "url": "static/js/main.4f7618e4.chunk.js",
    "revision": "154631bf847e1a3132a72b9d92c914a9"
  },
  {
    "url": "static/js/runtime-main.5c7cfaaf.js",
    "revision": "61a4737e4d15a49dbb395604cb5a5f10"
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