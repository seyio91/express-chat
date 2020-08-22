chatCache = 'chat-messages'

// Call event Listener
self.addEventListener('install', async e => {
    // console.log('Service Worker installed')

    caches.delete(chatCache)
        .then(bool => console.log(`cache is deleted: ${bool}`))
    
});

// Call activate
self.addEventListener('activate', e => {
    // console.log('Service Worker Activated')
});


// fetch event
self.addEventListener('fetch', e => {
    // console.log('Service Worker Fetch')
    if (e.request.method !== 'GET') return;
    const req = e.request;
    var url = new URL(e.request.url);
    if (!url.pathname.includes('currentchat') || !url.pathname.includes('userlist')) return
    
    // let urlparts = url.pathname.split('/')
    // let chatid = urlparts[2]

    e.respondWith(networkFirst(req))
});

async function networkFirst(req){
    const cache = await caches.open(chatCache);

    try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    } catch (error) {
        return await cache.match(req);
    }
}