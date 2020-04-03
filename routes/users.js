// Protected Routes
const express = require('express');
const linkParser = require('parse-link-header');
const router = express.Router();
const { buildUrl, getData, getUsers, postData} = require('../helpers/jsquery')
const { userAuth } = require('../helpers/auth')
require('express-async-errors');


router.get('/error', (req, res) => {
    throw new Error(500, 'Internal server error');
  })

//Home Page

router.get('/hello', async(req, res ) =>{ 
    res.send('Hello  world');
    return
})

router.get('/logout', userAuth , async(req, res)=> {
    // console.log('endpoint reached')
    req.logout()
    req.session.destroy(()=>{res.redirect('/')})
    // console.log(req.session)
    // res.redirect('/')
    return
})

router.get('/chat', userAuth, async(req, res) => {
    // res.render('chat', { user: req.user.email })
    res.render('element')
})

router.get('/currentchat/:cid',userAuth, async(req, res)=>{
    const convo = await getData(`http://localhost:3000/messages?cid=${req.params.cid}`)
    res.json(convo)
})

// replace later
router.get('/conversations', userAuth, async(req, res)=>{
    const sentconversations = await getData(`http://localhost:3000/conversations?uid1=${req.user.email}`)
    const recievedconversations = await getData(`http://localhost:3000/conversations?uid2=${req.user.email}`)
    conversations = [ ...recievedconversations,...sentconversations]

    res.json(conversations)
})

router.get('/', userAuth ,async(req, res)=>{
    let {page = 1, limit = 5} = req.query
    // if (req.session.view){
    //     req.session.view ++;
    // }
    // else{
    //     req.session.view = 0;
    // }

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
    // console.log(req.user.username)
    res.render('index', {
        data, 
        paginationData, 
        tags,
        username: req.user.username
    })
})

//tag Views
router.get('/tag_post/:tag', userAuth, async(req,res)=>{
    console.log(req.params.tag)
    const data = await getData(`http://localhost:3000/blog_posts?tags=${req.params.tag}`)
    res.render('tags', { 
        data, 
        pageTitle:req.params.tag
    })
})

// Article View Route
router.get('/views/:pageID', userAuth, async(req, res)=>{
    const [post, comments] = await Promise.all([getData(`http://localhost:3000/blog_posts/${req.params.pageID}`), getData(`http://localhost:3000/comments/?blog_id=${req.params.pageID}`)]);

    res.render('views', {article: post, comments: comments.reverse()})
})

// Comment Post Route
router.post('/views/:pageID', userAuth, async(req, res)=>{

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