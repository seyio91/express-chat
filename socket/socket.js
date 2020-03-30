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
    // io.on('changeafter', socket =>{
        console.log(`New Connection ${socket.id}`)
    
        const userID = socket.request.user.email

        if (isActiveUser(userID, activeUsers)){

            activeUsers = updateUserSession(userID, socket.id, activeUsers)

        } else {

            // Create New User Session
            activeUsers = addUserSession(userID, socket.id, activeUsers)
            socket.broadcast.emit('onlineuser',  `${userID} is now online`)
        }
    
        socket.on('test', (data, callback)=>{

            callback(getOnlineUsers(userID, activeUsers))
            // console.log(`user making callback ${userID}`)
        })
    
        // everyone connecting should see all active users. all sockets
        socket.on('new session', (callback)=>{
            callback({userid: userID, connectedUsers: getOnlineUsers(userID, activeUsers)})
            console.log(`${userID} has started a new session ${getOnlineUsers(userID, activeUsers)}`)
            console.log(activeUsers)
            // console.log(`test connections available: ${testconnections}`)
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
    
    
            // sendSockets = activeUsers[recipient]
            sendSockets = getUserSession(recipient, activeUsers)
            sendSockets.forEach(socketid => {
                io.to(`${socketid}`).emit('receive Message', { message: msg, sender: userID });
            })
    
        })
    
        // disconnect
        socket.on('disconnect', ()=>{
            console.log('a user has left')
            console.log(`acive users at this before deleting`)
            console.log(activeUsers)
            if (activeUsers[userID]){
            // check number of connections left
                if (activeUsers[userID].length > 1){
                    console.log(`users session before remove confirm`)
                    console.log(activeUsers)
                    // if greater than 1, remove the particular session
                    // activeUsers[userID] = activeUsers[userID].filter( id=> socket.id != id)
                    activeUsers = removeSession(userID, socket.id , activeUsers);
                    console.log(`checking if user remove`)
                    console.log(activeUsers)
                } else {
                    //if last socket, set to offline
                    delete activeUsers[userID]
                    console.log('user is deleted')
                    console.log(activeUsers)
                    io.emit('onlineuser', 'user has disconnected')
                }
            }
            
            
        })
        console.log(activeUsers)
    })

}

// userexists function
function isActiveUser(user, userList){
    return user in userList;
}

// add user to session
function addUserSession(user, session ,userList){
    userList[user] = [session];
    return userList;
}

// add user session
function updateUserSession(user, session ,userList){
    userList[user].push(session);
    return userList
}



//get other users
function getOnlineUsers(user, userList){
    return Object.keys(userList).filter(userCur=> userCur != user)
}

//get user session
function getUserSession(user, userList){
    return userList[user]
}

//remove user session. can use the get session also
function removeSession(user, session ,userList){
    userList[user] = userList[user].filter( id=> session != id);
    return userList
}

//removeuser or offline
function userOffline(user, userList){
    delete userList[user];
    return userList
}


module.exports = { sessionData, socketconn }