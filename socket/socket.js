// const sockets = {}
// const connections = [];
// sockets.init = (server)=>{
//     const socketio = require('socket.io')
//     const io = socketio(server);

//     io.use(passportSocketIo.authorize(sessionData));

//     io.on('connection', socket =>{
//         console.log(`New Connection ${socket.id}`)
//         // check if user exists in connections


//         socket.emit('online-user', 'User is online')
//     })
// }


// // module.exports = sockets