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
    "revision": "3dc44663bbd6410a357033ee772c6c7c"
  },
  {
    "url": "precache-manifest.854b6925483e9631fcf3be93a0cb4bdb.js",
    "revision": "854b6925483e9631fcf3be93a0cb4bdb"
  },
  {
    "url": "service-worker.js",
    "revision": "fd25f65fb5214c92ac3cf6d902d23269"
  },
  {
    "url": "static/js/2.78dbfbdc.chunk.js",
    "revision": "80c7302642872a19645a785e99891d6b"
  },
  {
    "url": "static/js/main.e8e6fd1f.chunk.js",
    "revision": "016c02ca8835ee71824b0d480b2bce38"
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