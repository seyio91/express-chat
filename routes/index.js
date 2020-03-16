// General Routes
const express = require('express');
const router = express.Router();
const { validationRules, validate } = require('../helpers/validators')
const { User } = require('../helpers/jsquery')


router.get('/signup', async(req, res)=> {
    res.render('signup')
})

router.post('/signup', validationRules(), validate, async(req, res)=> {
    const {signupfName, signuplName, signupEmail, signupuName, passCode, passConfirm} = req.body
    if (res.locals.errors){
        // if errors render and pass values back
        console.log('error exists')
        res.render('signup', {
            errors: res.locals.errors,
            signupfName,
            signuplName,
            signupuName,
            signupEmail
        })
        res.end()
    }

    // Check user email exists using getData helper
    const result = await User.findOneUser({email:signupEmail})
    if (result.length > 0){
        errors = [ 'User Exists' ]
        res.render('signup', {
             errors: errors,
             signupfName,
             signuplName,
             signupuName
            })
        res.end()
    }



    // Create User
    newUser = new User(signupfName, signuplName, signupuName, signupEmail, passCode)
    newUser.save()
    res.render('signup')
})



module.exports = router;