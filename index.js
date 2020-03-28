const http = require('http')
const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session')
var SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport')
const fetch = require('node-fetch');
const methodOverride = require('method-override')
const handleError = require('./helpers/error')
const socketio = require('socket.io')
// const socketio = require('./socket/socket')
const passportSocketIo = require("passport.socketio");
const cookieParser = require('cookie-parser')

// require('express-async-errors');

const app = express()
server = http.createServer(app);
// socketio.init(server)
const io = socketio(server)

// Check if DB can connect and Quit if not// replace with db connection
fetch('http://localhost:3000/users')
    .then(console.log('DB Connected'))
    .catch(err=>{
        console.log('App cannot connect to database');
        process.exit(1);   
        })


// require passport helper module
require('./helpers/passport')(passport)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + '/public'))

sessionStore = new SQLiteStore()

// session middleware test
// const sessionMiddleWare = session({
//     store: sessionStore,
//     secret: 'SOMEVERYSECRETPASSWORD',
//     resave: false,
//     saveUninitialized: false
//   })


  sessionData = {
    store: sessionStore,
    secret: 'SOMEVERYSECRETPASSWORD',
    resave: false,
    saveUninitialized: false
  }

app.use(session(sessionData))
// io.use((socket, next)=>{
//     sessionMiddleWare(socket.request, socket.request.res, next)
// })

// app.use(sessionMiddleWare)

sessionData.cookieParser = cookieParser;
io.use(passportSocketIo.authorize(sessionData))

// session middleware
// app.use(session({
//     store: sessionStore,
//     secret: 'SOMEVERYSECRETPASSWORD',
//     resave: false,
//     saveUninitialized: false
//   }));


// passport middleware
app.use(passport.initialize());
app.use(passport.session())

// 
// io.use(passportSocketIo.authorize({
//     key: 'connect.sid',
//     secret: process.env.SECRET_KEY_BASE,
//     store: sessionStore,
//     passport: passport
//   }));

// connect flash middleware
app.use(flash())

// Message Global Var
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.session_error = req.flash('error'); // from passport
    next()
})



app.use('/', require('./routes/users'))
app.use('/users', require('./routes/index'))

// default error handling
app.use((req, res, next) => {
    res.status(404).send({
    status: 404,
    error: 'Not found'
    })
   })

// app.use(methodOverride())

app.use(function (err, req, res, next) {
    console.error(err.stack);
    handleError(err, res);
    // res.status(500).send('Something went wrong!!');
});

activeUsers = {}

io.on('connection', socket =>{
    console.log(`New Connection ${socket.id}`)

    const userID = socket.request.user.email
    // console.log(`userID is : ${userID}`)
    // console.log(Object.keys(io.sockets.sockets))
    
    otherUsers = Object.keys(activeUsers).filter(user=> user != userID);
    
    // Check if username exists in session
    if (userID in activeUsers){
        // add socket id to user
        activeUsers[userID].push(socket.id)
    } else {
        // Add Socket to User
        activeUsers[userID] = [socket.id]
        socket.broadcast.emit('onlineuser',  `${userID} is now online`)
        console.log('new user action triggered')
    }

    // work around online => return confirm online from UI
    // here returns to each socket a diff user
    

    socket.on('test', (data, callback)=>{
        let userConnect = Object.keys(activeUsers).filter(user=> user != userID);
        callback(userConnect)
        console.log(`user making callback ${userID}`)
    })

    // everyone connecting should see all active users. all sockets
    socket.on('new session', (callback)=>{
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
        
        // console.log(activeUsers)
        
    })

})


const PORT = process.env.PORT || 5000

server.listen(PORT, ()=>{
    console.log(`server is listening on port ${PORT}`)
});