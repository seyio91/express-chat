// General Routes
const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router();
const { validationRules, validate } = require('../helpers/validators')
const { User } = require('../helpers/jsquery')
const passport = require('passport')


router.get('/signup', async(req, res)=> {
    res.render('signup')
})

router.post('/signup', validationRules(), validate, async(req, res)=> {
    const {signupfName, signuplName, signupEmail, signupuName, passCode, passConfirm} = req.body
    if (res.locals.errors){
        // if errors render and pass values back
        console.log(res.locals.errors)
        console.log('error exists')
        res.render('signup', {
            signupfName,
            signuplName,
            signupuName,
            signupEmail
        })
        // res.end()
        return
    }

    // Check user email exists using getData helper
    const result = await User.findOneUser({email:signupEmail})
    if (result.length > 0){
        res.locals.errors = [ 'User Exists' ]
        res.render('signup', {
             signupfName,
             signuplName,
             signupuName
            })
        // res.end()
        return
    }

    // Create User
    newUser = new User(signupfName, signuplName, signupuName, signupEmail, passCode)
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            // Store hash in your password DB.
            newUser.password = hash
            newUser.save()
            req.flash('success_msg', 'You can login with your details')
            res.redirect('login')
        });
    });
})


router.get('/login', async(req, res) => {
    res.render('login')
})


router.post('/login', async(req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next)
})

module.exports = router;