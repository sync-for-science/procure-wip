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
    "revision": "b881ad174a69f7812186c974f655e053"
  },
  {
    "url": "precache-manifest.852d8dc380ee0e68e774c07348dace9b.js",
    "revision": "852d8dc380ee0e68e774c07348dace9b"
  },
  {
    "url": "service-worker.js",
    "revision": "f82cf9a8057cbbb4082a95fedbafb897"
  },
  {
    "url": "static/js/2.2393ff12.chunk.js",
    "revision": "71603b3a48033b80cdc8590eea60af03"
  },
  {
    "url": "static/js/main.b1604003.chunk.js",
    "revision": "0fbfa68a05109398c1532985f594fa9e"
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