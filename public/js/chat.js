// Make Sure SW are supported
if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../sw_data_route.js')
            .then(reg => console.log('service workers registered'))
            .catch(err => console.log(`Service Worker: Err ${err}`))
    })
}

// if (typeof(window.SharedWorker) === 'undefined') {
//     throw("Your browser does not support SharedWorkers")
// }
