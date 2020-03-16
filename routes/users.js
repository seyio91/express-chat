// Protected Routes
const express = require('express');
const linkParser = require('parse-link-header');
const fetch = require('node-fetch');
const router = express.Router();

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

router.get('/', async(req, res)=>{
    let {page = 1, limit = 5} = req.query

    queryString = {
        "_sort": "id",
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

router.get('/tag_post/:tag', async(req,res)=>{
    console.log(req.params.tag)
    const data = await getData(`http://localhost:3000/blog_posts?tags=${req.params.tag}`)
    res.render('tags', { data: data, pageTitle:req.params.tag})
})


router.get('/views/:pageID', async(req, res)=>{
    // resData = await getData(`http://localhost:3000/blog_posts/${req.params.pageID}`)
    const [post, comments] = await Promise.all([getData(`http://localhost:3000/blog_posts/${req.params.pageID}`), getData(`http://localhost:3000/comments/?blog_id=${req.params.pageID}`)]);

    // res.send(req.params)
    res.render('views', {article: post, comments: comments.reverse()})
})

router.post('/views/:pageID', async(req, res)=>{

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


module.exports = router;