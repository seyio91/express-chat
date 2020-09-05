// Make Sure SW are supported
if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../sw_data_route.js')
            .then(reg => console.log('service workers registered'))
            .catch(err => console.log(`Service Worker: Err ${err}`))
    })
}

const WorkerIO = new SharedWorker('../js/shared_worker.js', 'NDN-Worker');
const broadcastChannel = new BroadcastChannel("WEBSOCKETCHANNEL")