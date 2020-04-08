// importScripts('./socket/socket.js');
console.log('script imported')


console.log('script imported')
// self.port.start(); //open the port connection to enable two-way communication

// self.onconnect = function(e) {
//     // console.log('i connected to the shared woker')
//     var port = e.ports[0];  // get the port
//     // port.start()

//     port.postMessage('Connected to Worker');

//     port.onmessage = function(e) {
//         console.log('Worker revceived arguemnts:', e.data);
//         port.postMessage(e.data[0] + e.data[1]);
//     }
//     port.start();
// }

var ports = [];
let port = null;
self.addEventListener('connect', function(eventC){
//   'use strict';

  ports = eventC.ports;
  port = ports[0];

//   port.postMessage('WorkerIO: connected');
    port.postMessage('from "clientPort":  with love :)');
// port.postMessage('from "clientPort": ' + clientPort.toString() + ', with love :)');

  port.addEventListener('message', function(eventM){
    var data = eventM.data;
    console.log('o************ OnMessage ************o\n\n'
      , '\t data:', data, '\n'
    );
    port.postMessage('from "clientPort":  with love :) 2');
  }, false);

// port.onmessage = function(e) {
//     port.postMessage('pong'); // not e.ports[0].postMessage!
//     // e.target.postMessage('pong'); would work also
//   }
  port.start();
}, false);