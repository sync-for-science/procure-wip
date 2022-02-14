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
    "revision": "6fc98439d94a7193b84bac8b21662ed4"
  },
  {
    "url": "precache-manifest.4eb99ebbe8887e789505495b2fedda27.js",
    "revision": "4eb99ebbe8887e789505495b2fedda27"
  },
  {
    "url": "service-worker.js",
    "revision": "4590e79f278b874a23024ea1868d02ce"
  },
  {
    "url": "static/js/2.da07e11f.chunk.js",
    "revision": "184f0356c6fb946b433ae6de6675163c"
  },
  {
    "url": "static/js/main.dc3e37cd.chunk.js",
    "revision": "c3ab10369d998e7cb1f14efd0c70839c"
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