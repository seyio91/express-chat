const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')

const app = express()

// Check if DB can connect and Quit if not

// require passport helper module
require('./helpers/passport')(passport)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + '/public'))

// session middleware
app.use(session({
    secret: 'SOMEVERYSECRETPASSWORD',
    resave: true,
    saveUninitialized: true
  }));

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


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`server is listening on port ${PORT}`)
});