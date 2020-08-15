const socketconn = {}
const session = require('express-session')
var SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require('cookie-parser')
const passportSocketIo = require("passport.socketio");
const { postData, updateData } = require('../helpers/jsquery')
const socketHelpers = require('./helpers')
const adapter = require('socket.io-redis');
const moment = require('moment')
const redisAdapter = adapter({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  });

const sessionStore = new SQLiteStore()
const client = require('../connections/redis');

const sessionData = {
    store: sessionStore,
    secret: 'SOMEVERYSECRETPASSWORD',
    resave: false,
    saveUninitialized: false
}


socketconn.init = (server)=>{
    const socketio = require('socket.io')
    const io = socketio(server, {
        pingInterval: 30000
    });
    io.adapter(redisAdapter);
    
    sessionData.cookieParser = cookieParser;
    io.use(passportSocketIo.authorize(sessionData));

    activeUsers = {}

    io.on('connection', async socket =>{
    // io.on('changeafter', socket =>{
        console.log(`New Connection ${socket.id}`)
    
        const userID = socket.request.user.email

        // console.log(socket.connected)
        // save socket
        // canConnect = await client.set(userID, socket.id, 'NX', 'EX', 30)
        // console.log(`User can connect ${canConnect}`)
        // if (!canConnect){
        //     console.log('i be disconnecting you')
        //     socket.emit('closing', 'Close Socket')
        //     socket.disconnect(true)
        // }

        if (socketHelpers.isActiveUser(userID, activeUsers)){

            activeUsers = socketHelpers.updateUserSession(userID, socket.id, activeUsers)

            // check if sessions exist in redis
            // client.hsetnx(userID,'socket', socket.id,'time', JSON.stringify(date()))

            // return and update

            // save session

        } else {

            // Create New User Session
            activeUsers = socketHelpers.addUserSession(userID, socket.id, activeUsers)
            // socket.broadcast.emit('userStateChange', {user: userID, state: true})

            // client.HSETNX(userID,'socket', socket.id,'time', new Date())
            // client.HSETNX
            // tell everyone my state has changed

            // create new redis entry
        }
    
        // return user to socket
        socket.on('NEWSESSION', (callback)=>{
            callback(userID)
        })

        socket.conn.on('packet', async (packet)=>{
            let { type } = packet
            if (type == 'ping' ){
                console.log(`keep alive for ${socket.id}`)
                await client.set(userID, socket.id, 'XX', 'EX', 20)
                await client.hmset(`${userID}-details`, 'time', moment().format(), 'server', 1)
            }
        })
    
        socket.on('NEWMESSAGE', async   (data, callback) => {
            
            const { cid, msg, recipient, newchat } = data

            newmessage = socketHelpers.createMessage(data, userID)
            conversation = socketHelpers.updateConversation(data, userID)

            // console.log('storing new message', newmessage)

            // send to save messsage
            // postData('http://localhost:3000/messages', newmessage)
            //     .then(()=> {
            //         if (newchat){
            //             // updating
            //             postData('http://localhost:3000/conversations', conversation)
            //                 .then(()=> {
            //                     callback(true)
            //                 })
            //                 .catch(err => console.log(err))
            //         } else {
                        // updateData('http://localhost:3000/conversations', cid , conversation)
                        // .then(()=> {
                            // console.log('Success Updating Conversation');
                            // callback(true)
                        // })
                //     }
                // })
    
            // only true after saving the message
            callback(true)

            sendSockets = await socketHelpers.getUserSession(recipient)

            if (!sendSockets) return
            
            // to fix send whole message back
            // This should publish through redis
            io.to(`${sendSockets}`).emit('RECEIVE_MESSAGE', newmessage);
     
        })

        //get online users
        socket.on('GETONLINEUSER', async (data, callback)=> {
            console.log('online users called')
            let timestamp = await client.hget(`${data}-details`, 'time')
            console.log(timestamp)
            callback(timestamp)
        })

        socket.on('MESSAGEREAD', (data, callback)=>{
            console.log(`Update Message as read: ${data}`)
            // PUT not updating
            // body = {lastMessage: {
            //     read: true
            // }}
            // updateData('http://localhost:3000/conversations', data , body)
            //     .then(console.log('done'))
        })
    
        // disconnect
        socket.on('disconnect', async ()=>{
            // get session from redis
            console.log(`disconnected called for ${socket.id}`)
            await client.del(userID)
            if (activeUsers[userID]){
            // check number of connections left
                if (activeUsers[userID].length > 1){
                    activeUsers = socketHelpers.removeSession(userID, socket.id , activeUsers);
                } else {
                    //if last socket, set to offline
                    delete activeUsers[userID]
                    // socket.broadcast.emit('userStateChange', {user: userID, state: false})
                }
            }
            
            
        })
        console.log(activeUsers)
    })

    io.use(async (socket, next)=>{
        let user = socket.request.user.email
        // canConnect = await client.set(user, socket.id, 'NX', 'EX', 30)
        canConnect = await client.set(user, socket.id)
        console.log(`User can connect ${canConnect}`)
        if (!canConnect){
            console.log(`Closing Socket: ${socket.id}`)
            socket.disconnect()
            return
        }
        await client.hmset(`${user}-details`, 'time', moment().format(), 'server', 1)
        next()
    })
 
}


module.exports = { sessionData, socketconn }