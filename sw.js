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
    "revision": "ee3d8f1f25c7b8f986d91e5e93030ed6"
  },
  {
    "url": "precache-manifest.1397e3d9a8629a583278ad1939967a62.js",
    "revision": "1397e3d9a8629a583278ad1939967a62"
  },
  {
    "url": "service-worker.js",
    "revision": "497055dc001feb1c54d10d1a6ee4dbf9"
  },
  {
    "url": "static/js/2.78dbfbdc.chunk.js",
    "revision": "80c7302642872a19645a785e99891d6b"
  },
  {
    "url": "static/js/main.a595fb5c.chunk.js",
    "revision": "7e03b722560e5f315491477087ad370c"
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