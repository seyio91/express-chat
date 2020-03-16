const express = require('express');
const bodyParser = require('body-parser');
// const linkParser = require('parse-link-header')
// const fetch = require('node-fetch')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.use('/', require('./routes/users'))


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`server is listening on port ${PORT}`)
});