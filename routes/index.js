// General Routes
const express = require('express');
const linkParser = require('parse-link-header');
const fetch = require('node-fetch');
const router = express.Router();
const { validationRules, validate } = require('../helpers/validators')
const { buildUrl, getData, User } = require('../helpers/jsquery')


router.get('/signup', async(req, res)=> {
    res.render('signup')
})

router.post('/signup', validationRules(), validate, async(req, res)=> {
    const {signupfName, signuplName, signupEmail, signupuName, passCode, passConfirm} = req.body
    // // post validation

    // // Check user email exists using getData helper
    userUrl = buildUrl("http://localhost:3000/users/", { email: signupEmail})
    result = await getData(userUrl)
    if (result.length > 0){
        errors = [ 'User Exists' ]
        res.render('signup', { errors: errors})
        res.end()
    }

    // Create User
    newUser = new User(signupfName, signuplName, signupuName, signupEmail, passCode)
    newUser.save()
    // console.log(newUser)
    res.render('signup')
})

// router.get('/', async (req, res) => {
//     answer = await searchData('http://localhost:3000/users/?email=sebastian@codingthesmartway.com')
//     console.log(answer)
//     res.render('signup')
// })


module.exports = router;