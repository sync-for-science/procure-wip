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
    "revision": "9696caef4573c84a1fe8d0f98bc93e9b"
  },
  {
    "url": "precache-manifest.f83b0519ba18879656c1380d7307e05b.js",
    "revision": "f83b0519ba18879656c1380d7307e05b"
  },
  {
    "url": "service-worker.js",
    "revision": "32ef9d5b8c6619c58e6f31c7a0ecaba6"
  },
  {
    "url": "static/js/2.2393ff12.chunk.js",
    "revision": "71603b3a48033b80cdc8590eea60af03"
  },
  {
    "url": "static/js/main.65e8201e.chunk.js",
    "revision": "96ea63e517ce72c0e13f30f768c5d755"
  },
  {
    "url": "static/js/runtime-main.cbb0e4f4.js",
    "revision": "5e9710e1b31014efbd3f578f6cf71dde"
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