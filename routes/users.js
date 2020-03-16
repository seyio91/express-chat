// Protected Routes
const express = require('express');
const linkParser = require('parse-link-header');
const router = express.Router();
const { buildUrl, getData, getUsers, postData} = require('../helpers/jsquery')

//Home Page
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
    res.render('index', {data, paginationData, tags})
})

//tag Views
router.get('/tag_post/:tag', async(req,res)=>{
    console.log(req.params.tag)
    const data = await getData(`http://localhost:3000/blog_posts?tags=${req.params.tag}`)
    res.render('tags', { data, pageTitle:req.params.tag})
})

// Article View Route
router.get('/views/:pageID', async(req, res)=>{
    const [post, comments] = await Promise.all([getData(`http://localhost:3000/blog_posts/${req.params.pageID}`), getData(`http://localhost:3000/comments/?blog_id=${req.params.pageID}`)]);

    res.render('views', {article: post, comments: comments.reverse()})
})

// Comment Post Route
router.post('/views/:pageID', async(req, res)=>{

    commentData = {
        "cName": req.body.comment_name,
        "cEmail": req.body.comment_email,
        "blog_id": req.params.pageID,
        "date": Date.now,
        "cBody": req.body.comment_body
    }

    await postData('http://localhost:3000/comments', commentData)
    res.redirect(`/views/${req.params.pageID}`)

})


module.exports = router;