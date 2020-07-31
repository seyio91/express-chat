const socketconn = {}
const session = require('express-session')
var SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require('cookie-parser')
const passportSocketIo = require("passport.socketio");
const { postData, updateData } = require('../helpers/jsquery')
const uuid = require('uuid')

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
    messageid = 1009

    io.on('connection', socket =>{
    // io.on('changeafter', socket =>{
        console.log(`New Connection ${socket.id}`)
    
        const userID = socket.request.user.email

        if (isActiveUser(userID, activeUsers)){

            activeUsers = updateUserSession(userID, socket.id, activeUsers)

        } else {

            // Create New User Session
            activeUsers = addUserSession(userID, socket.id, activeUsers)
            // socket.broadcast.emit('onlineuser',  `${userID} is now online`)
            socket.broadcast.emit('userStateChange', {user: userID, state: true})
            // tell everyone my state has changed
        }
    
        // socket.on('test', (data, callback)=>{

        //     callback(getOnlineUsers(userID, activeUsers))
        // })
    
        // everyone connecting should see all active users. all sockets
        socket.on('new session', (callback)=>{
            callback(userID)
        })
    
        // console.log(activeUsers)
    
        socket.on('new Message', (data, callback) => {
            
            const { cid, msg, recipient } = data

            newmessage = createMessage(data, userID)
            conversation = updateConversation(data, userID)

            // console.log('storing new message', newmessage)

            // send to save messsage
            // postData('http://localhost:3000/messages', newmessage)
            //     .then(()=> {
            //         console.log("success creating new message")
            //         updateData('http://localhost:3000/conversations', cid , conversation)
            //             .then(()=> console.log('Success Creating Conversation'))
            //     })
    
            // only true after saving the message
            callback(true)

            // console.log('receipient available: ', sendSockets)
            sendSockets = getUserSession(recipient, activeUsers)
            if (!sendSockets) return
            sendSockets.forEach(socketid => {
                // to fix send whole message back
                io.to(`${socketid}`).emit('receive Message', newmessage);
            })
    
        })

        //get online users
        socket.on('getonlineUsers', (callback)=> {
            callback(getOnlineUsers(userID, activeUsers))
            console.log('i got called')
        })
    
        // disconnect
        socket.on('disconnect', ()=>{
            if (activeUsers[userID]){
            // check number of connections left
                if (activeUsers[userID].length > 1){
                    activeUsers = removeSession(userID, socket.id , activeUsers);
                } else {
                    //if last socket, set to offline
                    delete activeUsers[userID]
                    // io.emit('userStateChange', {user: userID, state: false})
                    socket.broadcast.emit('userStateChange', {user: userID, state: false})
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

function getTime(){
    // current timestamp in milliseconds
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    return year + "-" + month + "-" + date;
}

// Helper to create message
function createMessage(data, userid){
    const { cid, msg, timestamp } = data
    return { id: uuid.v4(), message: msg, sender: userid, cid: cid, timestamp, read: false }
}

// create conversation
function updateConversation(data, userid){
    const { msg, recipient, timestamp, read } = data;
    return { uid1: userid, uid2: recipient, lastMessage: { message: msg, sender: userid, timestamp, read } }
}

module.exports = { sessionData, socketconn }