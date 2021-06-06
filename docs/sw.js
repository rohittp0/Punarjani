const VERSIONED_CACHE = "punarjani-cache-v3";
const PERSISTENT_CACHE = "persistent-cache-punarjani";

const versioned_urls = [
	"/",
	"./assets/css/style.css",
	"./assets/js/main.js",
	"./assets/vendor/aos/aos.css",
	"./assets/vendor/aos/aos.js",
	"./assets/vendor/bootstrap/css/bootstrap-icons.css",
	"./assets/vendor/bootstrap/css/bootstrap.min.css",
	"./assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
	"./assets/vendor/glightbox/js/glightbox.min.js",
	"./assets/vendor/isotope-layout/isotope.pkgd.min.js",
	"./assets/vendor/swiper/swiper-bundle.min.css",
	"./assets/vendor/swiper/swiper-bundle.min.js",
];

const persistent_urls = [
	"./assets/fonts/boxicons.woff2",
	"./assets/fonts/bootstrap-icons.woff2",
	"./assets/img/Working/edit.jpg",
	"./assets/img/Working/help.png",
	"./assets/img/Working/info.png",
	"./assets/img/Working/profile.jpg",
	"./assets/img/Working/register.jpg",
	"./assets/img/Working/slots.jpg",
	"./assets/img/developers/Rohit.jpg",
	"./assets/img/developers/sanu.jpg",
	"./assets/img/developers/Sunith.jpg",
	"./assets/img/logos/logo-192.png",
	"./assets/img/logos/logo-48.png",
	"./assets/img/logos/logo-512.png",
	"./assets/img/steps/step1.jpg",
	"./assets/img/steps/step2.jpg",
	"./assets/img/steps/step3.jpg",
	"./assets/img/steps/step4.jpg",
	"./assets/img/counts-bg.png",
	"./assets/img/features.png",
	"./assets/img/footer-bg.jpg",
	"./assets/img/hero-bg.jpg"
];

async function cacheAll(name, urls) 
{
	const cache = await caches.open(name);
	return await cache.addAll(urls);
}

self.addEventListener("install", (event) => 
	// Perform install steps
	event.waitUntil(
		Promise.all(
			cacheAll(VERSIONED_CACHE, versioned_urls),
			cacheAll(PERSISTENT_CACHE, persistent_urls)
		)));

self.addEventListener("activate", (event) =>
	event.waitUntil(
		caches.keys().then((cacheNames) => 
			Promise.all(cacheNames.map((cacheName) =>
			{
				if (VERSIONED_CACHE !== cacheName &&  PERSISTENT_CACHE !== cacheName) 
					return caches.delete(cacheName);
			}))
		)
	)
);

self.addEventListener("fetch", function(event) 
{
	event.respondWith(
		caches.match(event.request)
			.then(function(response) 
			{
				// Cache hit - return response
				if (response) 
					return response;
				
				return fetch(event.request).then(
					function(response) 
					{
						// Check if we received a valid response
						if(!response || response.status !== 200 || response.type !== "basic") 
							return response;

						const responseToCache = response.clone();
  
						caches.open(VERSIONED_CACHE)
							.then(function(cache) 
							{
								cache.put(event.request, responseToCache);
							});
  
						return response;
					}
				);
			})
	);
});
