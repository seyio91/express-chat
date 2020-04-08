// // Make Sure SW are supported
// if ('serviceWorker' in navigator){
//     window.addEventListener('load', () => {
//         navigator.serviceWorker
//             .register('../sw_data_route.js')
//             .then(reg => console.log('service workers registered'))
//             .catch(err => console.log(`Service Worker: Err ${err}`))
//     })
// }

// if (typeof(window.SharedWorker) === 'undefined') {
//     throw("Your browser does not support SharedWorkers")
// }
          
// var worker = new SharedWorker("./shared_worker.js");
// console.log(worker)




// worker.port.onmessage = function(evt){
//     console.log(evt.data);
//     console.log('shared web woker')
//     // $('#message').text(JSON.stringify(evt.data));
// };

// worker.onerror = function(err){
//     console.log(err.message);
//     worker.port.close();
// }

// worker.port.start();

// worker.port.postMessage([2,3]);

var WorkerIO = new SharedWorker('/js/shared_worker.js', 'NDN-Worker');

console.log('WorkerIO:', WorkerIO);

WorkerIO.port.addEventListener('message', function(eventM){
  console.log('OnMessage:', eventM.data);
});

WorkerIO.port.start();
WorkerIO.port.postMessage('This is a message from the client!');

WorkerIO.port.addEventListener('error', function(e){
  throw new Error('WorkerIO Error: could not open SharedWorker', e);
}, false);
// WorkerIO.port.start();