const assets = [
    'index.html',
    'js/app.js',
    'js/ui.js',
    'js/materialize.min.js',
    'css/styles.css',
    'css/materialize.min.css',
    'img/grocery-icon.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'pages/fallback.html'
];

const staticCacheName = 'site-static-v5';
const dynamicCacheName = 'site-dynamic-v5';

// Cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};


// Install service worker event
self.addEventListener('install', event => {
    console.log('service worker has been installed');
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets');
            return cache.addAll(assets);
        })
    );
});


// Activate event
self.addEventListener('activate', event => {
    console.log('service worker has been activated');
    event.waitUntil(
        caches.keys().then(keys =>{
            console.log(keys);
            // Cache versioning
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});



// Fetch event (when we try to get something from the server)
self.addEventListener('fetch', event => {
    console.log('fetch event', event);
    if(event.request.url.indexOf('firestore.googleapis.com') === -1) {
        event.respondWith(
            caches.match(event.request)
                .then(cacheRes => {
                    return cacheRes || fetch(event.request).then(fetchRes => {
                        return caches.open(dynamicCacheName).then(cache => {
                            cache.put(event.request.url, fetchRes.clone());
                            // Check cached items size
                            limitCacheSize(dynamicCacheName, 15);
                            return fetchRes;
                        })
                    });
                })

                // Conditional Fallback (will work only for html pages)
                .catch(() => {
                    if(event.request.url.indexOf('.html') > -1){
                        return caches.match('pages/fallback.html');
                    }
                })
        );
    }
});