importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js');

let connections = {};
var socket;
let port = null;

const sendAll = (event, data) => {
    for (ports in connections ){
        connections[ports].postMessage({event , data })
    }
} 

const broadcastChannel = new BroadcastChannel("")

self.addEventListener('connect', function(eventC){
    // new port
    port = eventC.ports[0];

    // Add Neew port to connections for this shared worker
    port.start()

    //if there is no existing connection, start new socket
    if (!socket){
        socket = io();
    }
    
    // port.postMessage({event:'totalconnections', connections})

    // Handling Emit New Sesion Event
    socket.emit('new session', (data)=>{
        // port.postMessage({event:'new session', data })
        // for (let i = 0; i < connections.length; i++ ){
        //     connections[i].postMessage({event:'new session', data })
        // }
        sendAll('new session', data)
    })
    
    socket.on('connect', ()=> {
        port.postMessage({ event: 'connect', data: ''})
    })

    socket.on('receive Message', (data) => {
        // port.postMessage({ event: 'receive Message', data })
        sendAll('receive Message', data)
    })

    socket.on('userStateChange', (data) => {
        // port.postMessage({ event: 'userStateChange', data })
        sendAll('userStateChange', data)
    })

    socket.on('disconnect', ()=> {
        // port.postMessage({ event: 'disconnect', data: '' })
        sendAll('disconnect', '')
    })
    

    port.postMessage(JSON.stringify(connections));

    port.addEventListener('message', function(eventM){


        let { event, data } = eventM.data;



        if (event == 'SWCONNECTED'){
            connections[data] = port
            // sendAll(event, JSON.stringify(data))
            // sendAll(event, data)
            connections[data].postMessage({event , data })
        }

        if (event == 'SWDISCONNECT'){
            
            delete connections[data]
            sendAll(event, JSON.stringify(connections))
            // sendAll(event, data)
        }


        if (event == 'getonlineUsers'){
            socket.emit(event, (users) => {
                // port.postMessage({ event, data })
                connections[data].postMessage({event , data:users })
            })
            // return
        }

        if (event == 'new Message'){
            socket.emit(event, data, (success)=>{
                // port.postMessage({event, data: { data, success }})
                sendAll(event, {data, success})
            })
        }

        // if (event == 'READRECIPIENT'){
        //     socket.emit(event, data)
        // }
        




    }, false);
    // port.addEventListener('unload', function(){

    //             sendAll("ClosingWorker", "workerclosed")

    // }, false);

    port.start();

}, false);