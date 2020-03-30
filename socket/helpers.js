

// userexists function
function isActiveUser(user, userList){
    return user in userList;
}

// add new user
function addUserSession(user, session ,userList){
    userList[user] = [session];
    return userList;
}

// add returning user session
function updateUserSession(user, session ,userList){
    userList[user].push(session);
    return userList
}



//get other users
function getOnlineUsers(user, userList){
    return Object.keys(userList).filter(userCur=> userCur != user)
}

//get user session
function getUserSession(user, userList){
    return userList[user]
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