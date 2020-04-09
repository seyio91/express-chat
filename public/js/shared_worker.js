importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js');

const connections = [];
var socket;
let port = null;

self.addEventListener('connect', function(eventC){
    // new port
    port = eventC.ports[0];

    // Add Neew port to connections for this shared worker
    connections.push(port);
    port.start()

    //if there is no existing connection, start new socket
    if (!socket){
        socket = io();
    }
    

    // Handling Emit New Sesion Event
    socket.emit('new session', (data)=>{
        port.postMessage({event:'new session', data})
    })
    
    socket.on('connect', ()=> {
        port.postMessage({ event: 'connect', data: ''})
    })

    socket.on('receive Message', (data) => {
        port.postMessage({ event: 'receive Message', data })
    })

    socket.on('userStateChange', (data) => {
        port.postMessage({ event: 'userStateChange', data })
    })

    socket.on('disconnect', ()=> {
        port.postMessage({ event: 'disconnect', data: '' })
    })
    

    // port.postMessage('from "clientPort":  with love :)');

    port.addEventListener('message', function(eventM){


        let { event, data } = eventM.data;

        if (event == 'getonlineUsers'){
            socket.emit(event, data => {
                port.postMessage({ event, data })
            })
            // return
        }

        if (event == 'new Message'){
            socket.emit(event, data, (success)=>{
                port.postMessage({event, data: { data, success }})
            })
        }
        




    }, false);

    port.start();

}, false);