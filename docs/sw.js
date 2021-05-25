const CACHE_NAME = "my-site-cache-v1";
const urlsToCache = [
	"/",
	"/assets/css/style.css",
	"/assets/js/main.js",
	"/assets/img/about.gif",
	"/assets/img/logo.png",
	"/assets/vendor/bootstrap/css/bootstrap.min.css",
	"assets/vendor/bootstrap/js/bootstrap.bundle.min.js"
];

self.addEventListener("install", (event) => 
{
	// Perform install steps
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function(cache) 
			{
				console.log("Opened cache");
				return cache.addAll(urlsToCache);
			})
	);
});

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
  
						caches.open(CACHE_NAME)
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
