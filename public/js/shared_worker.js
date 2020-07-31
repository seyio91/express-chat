importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js');

let connections = {};
let socket;
let port = null;
let currentTabsUserList = {};

const broadcastChannel = new BroadcastChannel("WEBSOCKETCHANNEL");

const broadCastEvent = (event, data) => {
    broadcastChannel.postMessage({event, data})
}

if (!socket){
    socket = io();
}

socket.on('connect', ()=> {
    broadcastChannel.postMessage({ event: 'WSCONNECTED', data: ''})
})

socket.on('receive Message', (data) => {
    // Handling If CurrentUser is receiving Message
    let uniqueCurrentUsers = Object.values(currentTabsUserList)
    let {cid} = data
    if (uniqueCurrentUsers.includes(cid)){
        data['read'] = true
        // update server
        socket.emit('MESSAGEREAD', cid)
    }
    
    broadCastEvent('receive Message', data)
})

socket.on('userStateChange', (data) => {
    broadCastEvent('userStateChange', data)
})

socket.on('disconnect', ()=> {
    broadCastEvent('WSDISCONNECT', '')
})

self.addEventListener('connect', function(eventC){
    port = eventC.ports[0];

    // // Add New port to connections for this shared worker
    port.start()
    

    port.postMessage(JSON.stringify(connections));

    port.addEventListener('message', function(eventM){


        let { event, data } = eventM.data;

        console.log(eventM.data)


        if (event == 'SWCONNECTED'){
            connections[data] = port
            connections[data].postMessage({event , data })
            connections[data].postMessage({event: 'CONNECTION_COUNT' , data: Object.keys(connections).length })
            // Handling Connected Users
            socket.emit('NEWSESSION', (result)=>{
                connections[data].postMessage({event: 'NEWSESSION' , data: result })
                
            })
        }

        // Disconnect Listening Port
        if (event == 'SWDISCONNECT'){
            delete connections[data]
            broadCastEvent(event='CONNECTION_COUNT', data=Object.keys(connections).length)
        }

        // Get Online Users for Requesting Tab
        if (event == 'GETONLINEUSERS'){
            socket.emit(event, (users) => {
                connections[data].postMessage({event , data:users })
            })
        }

        // Handle New Messages
        if (event == 'new Message'){
            socket.emit(event, data, (success)=>{
                broadCastEvent(event, {data, success})
            })
        }

        if (event == 'REMOVECURRENTUSER'){
            let { tab } = data
            delete currentTabsUserList[tab]
        }

        if (event == 'SETCURRENTUSER'){
            let { cid, tab } = data
            currentTabsUserList[tab] = cid
        }

        if (event == 'MESSAGEREAD'){
            socket.emit('MESSAGEREAD', data)
            broadCastEvent(event='SETMSGASREAD', data)
        }


    }, false);

    // port.start();

}, false);