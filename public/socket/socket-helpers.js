// Highlight New Conversation
// When new Conversation is clicked
// removes highlight from old conversation

export const removePrevConvo = (userChat) => {
    let oldUser = document.getElementById(userChat.participant)
    let oldUserclass = oldUser.getAttribute('class');
    oldUserclass = oldUserclass.replace('bg-light', "")
    oldUser.setAttribute('class', oldUserclass);
}


// Highlights the New Conversation
export const loadConversation = (userChat) => {
    let newUser = document.getElementById(userChat.participant);
    let newUserclass = newUser.getAttribute('class');
    newUser.setAttribute('class', `${newUserclass} bg-light`);
}


// If conversation thread is not opened
// conversation is highlighted when a new message is received
// This clears highlight when you click on the conversation
export const clearUnreadMessage = (user) => {
    let userdiv = document.getElementById(user);
    userdiv.className = userdiv.className.replace(' font-weight-bold' ,'');
}


// Notify User for Unread Message
export const notifyUnreadMsg = (user) => {
    const userElem = document.getElementById(user);
    if (userElem){
        userElem.className += ' font-weight-bold';
    }
}


// Creates a Received Message
export const newReceivedMsg = (messages) => {
    const { message, timestamp } = messages;
    let newmessage = document.createElement('div');
    newmessage.innerHTML = `
        <div class="media-body ml-3">
            <div class="conversation">
                <div class="senderChat"></div>
                <div class="bg-light rounded py-2 px-3 mb-2 chatwrapper">
                    <p class="text-small mb-0 text-muted">${message}</p>
                </div>
            </div>
                <p class="small text-muted">${timestamp}</p>
    </div>
    `
    newmessage.setAttribute('class', 'media w-50 mb-3')
    return newmessage;
}


// Creates a Sent Message Message
export const newSentMsg = (messages) => {
    const { message } = messages;
    let newmessage = document.createElement('div');
    newmessage.innerHTML = `
        <div class="media-body">
            <div class="conversation">
                <div class="bg-primary rounded py-2 px-3 mb-2 chatwrapper">
                    <p class="text-small mb-0 text-white">${message}</p>
                </div>
                <div class="receiverChat"></div>
            </div>
            <p class="small text-muted" style="float: right;">12:00 PM | Aug 13</p>
        </div>
        `
    newmessage.setAttribute('class', 'media w-50 ml-auto mb-3')
    return newmessage;
}


// Create User Conversations
export const getUserTab = (user, message) => {
    let contactWrapper = document.createElement('a');
    contactWrapper.innerHTML = `
            <div class="media">
                <div class="userbox">
                    <img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                    <span class="p-status offline-user" id="${user}-status"></span>
                </div>
        
                <div class="media-body ml-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">${user}</h6><small class="small font-weight-bold">21 Aug</small>
                    </div>
                <p class="font-italic text-muted mb-0 text-small">${message}</p>
                </div>
        </div>
    `
    contactWrapper.setAttribute('class', 'list-group-item list-group-item-action list-group-item-light rounded-0')
    contactWrapper.setAttribute('id', `${user}`);
    return contactWrapper;
    }


// Toggle User Online/ Offline
export const toggleUserStatus = (user, status) => {
    let userElem = document.getElementById(`${user}-status`);
    if (userElem) {
        let currClass = userElem.getAttribute('class');
        if (status){
            currClass = currClass.replace(' offline-user', '')
            userElem.setAttribute('class', `${currClass} online-user`)
        } else {
            currClass = currClass.replace(' online-user', '')
            userElem.setAttribute('class', `${currClass} offline-user`)
        }

    }
}

