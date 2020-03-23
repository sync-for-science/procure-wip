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
    "revision": "9f1fa649095cb83408faabbf41d11396"
  },
  {
    "url": "precache-manifest.d81a1edcadf9f49f28fe20b971ac152d.js",
    "revision": "d81a1edcadf9f49f28fe20b971ac152d"
  },
  {
    "url": "service-worker.js",
    "revision": "e36c0978b78f90e66c51dd11160c0f8d"
  },
  {
    "url": "static/js/2.2393ff12.chunk.js",
    "revision": "71603b3a48033b80cdc8590eea60af03"
  },
  {
    "url": "static/js/main.9ce10170.chunk.js",
    "revision": "cd92f3ace498b7299df23c39604ba087"
  },
  {
    "url": "static/js/runtime-main.4bf9fccc.js",
    "revision": "83f3da87909d68e7a91208f227f49d79"
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