const uuid = require('uuid')
const client = require('../connections/redis');
// userexists function
function isActiveUser(user, userList){
    return user in userList;
}

// add user to session
function addUserSession(user, session ,userList){
    userList[user] = [session];
    return userList;
}

// add user session
function updateUserSession(user, session ,userList){
    userList[user].push(session);
    return userList
}



//get other users
function getOnlineUsers(user, userList){
    return Object.keys(userList).filter(userCur=> userCur != user)
}

//get user session
const getUserSession = async user => {
    return await client.get(user)
}

//remove user session. can use the get session also
function removeSession(user, session ,userList){
    userList[user] = userList[user].filter( id=> session != id);
    return userList
}

//removeuser or offline
function userOffline(user, userList){
    delete userList[user];
    return userList
}

function getTime(){
    // current timestamp in milliseconds
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    return year + "-" + month + "-" + date;
}

// Helper to create message
function createMessage(data, userid){
    const { cid, msg, timestamp } = data
    return { id: uuid.v4(), message: msg, sender: userid, cid: cid, timestamp, read: false }
}

// create conversation
function updateConversation(data, userid){
    const { msg, recipient, timestamp, cid } = data;
    return {id: cid, uid1: userid, uid2: recipient, lastMessage: { message: msg, sender: userid, timestamp, read: false } }
}

module.exports = { isActiveUser,
                addUserSession,
                updateUserSession,
                getOnlineUsers,
                getUserSession,
                removeSession,
                userOffline,
                getTime,
                createMessage,
                updateConversation }