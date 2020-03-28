const socketconn = {}
const session = require('express-session')
var SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require('cookie-parser')
const passportSocketIo = require("passport.socketio");

const sessionStore = new SQLiteStore()

const sessionData = {
    store: sessionStore,
    secret: 'SOMEVERYSECRETPASSWORD',
    resave: false,
    saveUninitialized: false
}


socketconn.init = (server)=>{
    const socketio = require('socket.io')
    const io = socketio(server);
    
    sessionData.cookieParser = cookieParser;
    io.use(passportSocketIo.authorize(sessionData));

    activeUsers = {}
    messageArray = []

    io.on('connection', socket =>{
        console.log(`New Connection ${socket.id}`)
    
        const userID = socket.request.user.email

    
        socket.on('test', (data, callback)=>{
            let userConnect = Object.keys(activeUsers).filter(user=> user != userID);
            callback(userConnect)
            console.log(`user making callback ${userID}`)
        })
    
        // everyone connecting should see all active users. all sockets
        socket.on('new session', (callback)=>{
            if (userID in activeUsers){
                // add socket id to user
                activeUsers[userID].push(socket.id)
            } else {
                // Add Socket to User
                activeUsers[userID] = [socket.id]
                socket.broadcast.emit('onlineuser',  `${userID} is now online`)
                console.log('new user action triggered')
            }
    
            otherUsers = Object.keys(activeUsers).filter(user=> user != userID);
            console.log('new session to view active')
            console.log(activeUsers)
            callback(otherUsers)
            console.log(`${userID} has started a new session ${otherUsers}`)
        })
    
        // console.log(activeUsers)
    
        socket.on('new Message', data => {
            const { recipient, msg } = data
            // Do something with the data\
            console.log(`${userID} sent the Message ${msg} to user:  ${recipient}`)
            if (!recipient in activeUsers){
                return
            }
    
            //save message
    
    
            sendSockets = activeUsers[recipient]
            sendSockets.forEach(socketid => {
                io.to(`${socketid}`).emit('receive Message', { message: msg, sender: userID });
            })
    
        })
    
        // disconnect
        socket.on('disconnect', ()=>{
            console.log('a user has left')
            if (activeUsers[userID]){
            // check number of connections left
                if (activeUsers[userID].length > 1){
                    // if greater than 1, remove the particular session
                    activeUsers[userID] = activeUsers[userID].filter( id=> socket.id != id)
                } else {
                    //if last socket, set to offline
                    delete activeUsers[userID]
                    console.log('user is deleted')
                    console.log(activeUsers)
                    io.emit('onlineuser', 'user has disconnected')
                }
            }
            
            // console.log(activeUsers)
            
        })
    
    })

}


module.exports = { sessionData, socketconn }