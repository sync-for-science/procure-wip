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
    "revision": "4c5a8e088188bf2207e67e25af498a70"
  },
  {
    "url": "precache-manifest.c47fef9700efe3e7dfceb615d6755c9f.js",
    "revision": "c47fef9700efe3e7dfceb615d6755c9f"
  },
  {
    "url": "service-worker.js",
    "revision": "6b75bc8b43b71c0a52c37b26c20e0274"
  },
  {
    "url": "static/js/2.8fdeea1c.chunk.js",
    "revision": "f7ff126bf0b4b841e01032445bea9fc6"
  },
  {
    "url": "static/js/main.3ca37277.chunk.js",
    "revision": "34d6b44e955616420d29ef052201baa7"
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