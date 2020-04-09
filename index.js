const http = require('http')
const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')
const fetch = require('node-fetch');
const handleError = require('./helpers/error')
const { sessionData, socketconn } = require('./socket/socket')
const keys = require('./helpers/keys');

// require('express-async-errors');

const app = express()
server = http.createServer(app);
socketconn.init(server)

// Check if DB can connect and Quit if not// replace with db connection
// fetch('http://localhost:3000/users')
fetch(`${keys.DBCONN}/users`)
    .then(console.log('DB Connected'))
    .catch(err=>{
        console.log({msg:'App cannot connect to database', Error: err});
        process.exit(1);   
    })


    
// require passport helper module
require('./helpers/passport')(passport)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + '/public'))


// Use sessions. Note. remove session from socket file
app.use(session(sessionData))

// passport middleware
app.use(passport.initialize());
app.use(passport.session())

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

const PORT = process.env.PORT || 5000
console.log('database connection', `${keys.DBCONN}`)

server.listen(PORT, ()=>{
    console.log(`server is listening on port ${PORT}`)
});