const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const linkParser = require('parse-link-header')
const fetch = require('node-fetch')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))


app.get('/some', async(req, res)=>{

    let {page = 1, limit = 3} = req.query
    options = {
        url: "http://localhost:3000/blog_posts",
        method: "GET",
        qs: {
            _order: "desc",
            _page: page,
            _limit: limit
        }
    }
    console.log(req.url)
    console.log(req.baseUrl)
    console.log(req.get('host'))
    console.log(req.protocol)
    request(options, (error, response, body)=>{
        console.log(response.statusCode)
        console.log(linkParser(response.headers.link))
        paginationData = linkParser(response.headers.link);
        var data = JSON.parse(body)
        res.render('index', {data: data, paginationData: paginationData})
    })
})


function buildUrl(url, parameters) {
    let qs = "";
    for (const key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            const value = parameters[key];
            qs +=
                encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
        }
    }
    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1); //chop off last "&"
        url = url + "?" + qs;
    }

    return url;
}

async function getData(url) {
    const response = await fetch(url)
    const resData = await response.json()
    return resData
}

async function getUsers(url){
    response = await fetch(url)
    const data = await response.json();
    retVal = {
        data: data,
        link: response.headers.get('link')
    }
    return retVal
}

async function postData(url, data){
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const resData = await response.json()
    return resData
}

app.get('/', async(req, res)=>{
    let {page = 1, limit = 3} = req.query

    queryString = {
        "_order": "desc",
        "_page": page,
        "_limit": limit
    }

    absUrl = buildUrl("http://localhost:3000/blog_posts", queryString)
    const [posts, tags] = await Promise.all([getUsers(absUrl), getData('http://localhost:3000/tags')]);
    data = posts.data
    paginationData = paginationData = linkParser(posts.link);
    res.render('index', {data: data, paginationData: paginationData, tags: tags})
})


app.get('/views/:pageID', async(req, res)=>{
    // resData = await getData(`http://localhost:3000/blog_posts/${req.params.pageID}`)
    const [post, comments] = await Promise.all([getData(`http://localhost:3000/blog_posts/${req.params.pageID}`), getData(`http://localhost:3000/comments/?blog_id=${req.params.pageID}`)]);

    // res.send(req.params)
    res.render('views', {article: post, comments: comments})
})

app.post('/views/:pageID', async(req, res)=>{
    console.log(req.body.comment_name)
    console.log(req.body.comment_email)
    console.log(req.body.comment_body)
    
    commentData = {
        "cName": req.body.comment_name,
        "cEmail": req.body.comment_email,
        "blog_id": req.params.pageID,
        "date": new Date(),
        "cBody": req.body.comment_body
    }

    await postData('http://localhost:3000/comments', commentData)
    res.redirect(`/views/${req.params.pageID}`)

})


app.listen(5000, ()=>{
    console.log('server is listening on port 5000')
});