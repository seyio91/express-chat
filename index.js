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
    resData = await getData(`http://localhost:3000/blog_posts/${req.params.pageID}`)
    console.log(resData)
    // res.send(req.params)
    res.render('views', {article: resData})
})


app.listen(5000, ()=>{
    console.log('server is listening on port 3000')
});