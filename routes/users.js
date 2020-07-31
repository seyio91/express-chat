// Protected Routes
const express = require('express');
const linkParser = require('parse-link-header');
const router = express.Router();
const { buildUrl, getData, getUsers, postData} = require('../helpers/jsquery')
const { userAuth } = require('../helpers/auth')
require('express-async-errors');
const keys = require('../helpers/keys');


router.get('/error', (req, res) => {
    throw new Error(500, 'Internal server error');
  })

router.get('/logout', userAuth , async(req, res)=> {
    req.logout()
    req.session.destroy(()=>{res.redirect('/')})
    return
})

router.get('/chat', userAuth, async(req, res) => {
    // res.render('chat', { user: req.user.email })
    res.render('element')
})

// get all user
router.get('/userlist', userAuth, async(req, res) => {
    const userlist = await getData(`${keys.DBCONN}/users`)
    const results = userlist.map(a => {
        let userObj = {};
        userObj['name'] = `${a.first_name} ${a.last_name}`;
        userObj['email'] = a.email;
        return userObj;
    })
    
    res.json(results)
})

// router.get('/currentchat/:cid', async(req, res)=>{
router.get('/currentchat/:cid',userAuth, async(req, res)=>{
    const convo = await getData(`${keys.DBCONN}/messages?cid=${req.params.cid}`)
    res.json(convo)
})

router.get('/currentchat/:cid/:tid',userAuth, async(req, res)=>{
    const convo = await getData(`${keys.DBCONN}/messages?cid=${req.params.cid}&timestamp_gte=${req.params.tid}`)
    res.json(convo)
})

// get Conversations
router.get('/conversations', userAuth, async(req, res)=>{
    const sentconversations = await getData(`${keys.DBCONN}/conversations?uid1=${req.user.email}`)
    const recievedconversations = await getData(`${keys.DBCONN}/conversations?uid2=${req.user.email}`)
    conversations = [ ...recievedconversations,...sentconversations]

    res.json(conversations)
})

// get updateConversations
router.get('/conversations/:tid', userAuth, async(req, res)=>{
    const sentconversations = await getData(`${keys.DBCONN}/conversations?uid1=${req.user.email}&lastMessage.timestamp_gte=${req.params.tid}`)
    const recievedconversations = await getData(`${keys.DBCONN}/conversations?uid2=${req.user.email}&lastMessage.timestamp_gte=${req.params.tid}`)
    updatedConvos = [ ...recievedconversations,...sentconversations]
    console.log('returning updated conversations')
    console.log(updatedConvos)
    res.json(updatedConvos)
})

router.get('/', userAuth ,async(req, res)=>{
    let {page = 1, limit = 5} = req.query
    queryString = {
        "_sort": "id",
        "_order": "desc",
        "_page": page,
        "_limit": limit
    }

    absUrl = buildUrl(`${keys.DBCONN}/blog_posts`, queryString)
    const [posts, tags] = await Promise.all([getUsers(absUrl), getData(`${keys.DBCONN}/tags`)]);
    data = posts.data
    paginationData = paginationData = linkParser(posts.link);
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
    const data = await getData(`${keys.DBCONN}/blog_posts?tags=${req.params.tag}`)
    res.render('tags', { 
        data, 
        pageTitle:req.params.tag
    })
})

// Article View Route
router.get('/views/:pageID', userAuth, async(req, res)=>{
    const [post, comments] = await Promise.all([getData(`${keys.DBCONN}/blog_posts/${req.params.pageID}`), getData(`http://localhost:3000/comments/?blog_id=${req.params.pageID}`)]);

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

    await postData(`${keys.DBCONN}/comments`, commentData)
    res.redirect(`/views/${req.params.pageID}`)

})


module.exports = router;