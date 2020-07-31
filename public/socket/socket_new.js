const usersElem = document.getElementById("users");
const alluserElem = document.getElementById("allusers");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const newchat = document.getElementById('newchat');
const newchatlist = document.querySelector('.side-two');
const returnchat = document.getElementById('returnchat');
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation,notifyUnreadMsg, toggleConnStatus,
        setUsersOffline, newUserTab,conversationMerge, singleConvo } from './socket-helpers.js'


// return
newchat.addEventListener('click', (event)=>{
    newchatlist.style.left = '0';
    // load all users
    fetch('/userlist')
        .then(res => res.json())
            .then(allUsers => {
                // handle empty list here
                // if list lenght = 1
                // display no available users

                allUsers.forEach(user => {
                    // check if user is not current user
                    if (user.email != mainUser){
                        // render chat page
                        let contactWrapper = newUserTab(user)
                        alluserElem.appendChild(contactWrapper)
                    }
                })
            })
})

// return chat list
returnchat.addEventListener('click', (event)=>{
    newchatlist.style.left = '-100%';
    setTimeout(()=>{
        alluserElem.innerHTML = "";
    }, 200)
})


// new chat event
let newChatEvent = (userid) => {
    return ()=>{
        // search through conversationList
        
        if (currentChat !== chat){
            // setCurrentChat(chat);
        }
    }
}

let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
let conversationList = [];
const tabId = uuid.v4();


const displayConvolist = (firstload = false) => {
    usersElem.innerHTML = "";
    let indexChat = null
    conversationList.forEach((user, index) => {
        let { uid1, uid2, id, lastMessage } = user;
        let participant = mainUser == uid1 ? uid2 : uid1;
        let contactWrapper = getUserTab(lastMessage, participant)
        let chat = {participant, id, lastMessage}
        contactWrapper.addEventListener('click',(chatEvent)(chat))
        usersElem.appendChild(contactWrapper)
        if (index == 0) indexChat = chat
    })
    if (! firstload) {
        loadConversation(currentChat)
    } else {
        // chat for first conversation
        setCurrentChat(indexChat)
    }
}

WorkerIO.port.postMessage({ event: 'SWCONNECTED', data: tabId })


// setTimeout(() =>  WorkerIO.port.postMessage({ event: 'new Message', data: { cid: currentChat.id, msg: "Connected", sender: mainUser, recipient: currentChat.participant, timestamp: moment().format() } }), 2500);


window.addEventListener('beforeunload', ()=>{
    WorkerIO.port.postMessage({ event: 'SWDISCONNECT', data: tabId })
    if (currentChat) WorkerIO.port.postMessage({event: 'REMOVECURRENTUSER', data: {cid: currentChat.id, tab: tabId } })
    broadcastChannel.close()
})

broadcastChannel.addEventListener('message', bEvent => {
    console.log('OnBroadCast:', bEvent.data);
    let { event, data } = bEvent.data

    // New Connection
    if (event == 'WSCONNECTED'){
        if(timerId != null){
            clearTimeout(timerId)
            timerId = null
            toggleConnStatus(true)
    
            // Check If user was offline or just a page refresh
            // return if offline is less than one second
            if (lastOffline == null) return
 
            // Return Messages after last time offline
            fetch(`/conversations/${lastOffline}`)
                .then(res => res.json())
                    .then(updatedMessages=> {
                        if(!updatedMessages.length) return
                        // render the whole list and display
                        conversationList = conversationMerge(conversationList, updatedMessages)
                        let messageIndex = updatedMessages.findIndex(conversation => currentChat.id == conversation.id)
                        if (messageIndex != -1){
                            setReadChat(currentChat.id)
                            fetchMessages(currentChat.id, lastOffline)
                        }
                        displayConvolist()
                    })
                    if (currentChat) getOnlineUsers()
            lastOffline = null
        }
        
        return
    }

    // Disconnect
    if (event == 'WSDISCONNECT'){
        timerId = setTimeout(() => {
            toggleConnStatus(false)
            setUsersOffline()
            lastOffline = moment().format()
            // lastOffline = "2020-04-02T08:12:03+08:00"
            // console.log('my last time offline in this session', lastOffline)
        }, 3000);
    }

    // receive messages
    if (event == 'receive Message'){
        // issue with bold on currentuser
        const { sender, cid, message, read, timestamp } = data;
        if (currentChat.id == cid){
            let newmessage = newReceivedMsg(data)
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;    
        }
        
        let convo = singleConvo(cid, mainUser, message, read, sender, timestamp)
        conversationList = conversationMerge(conversationList, [convo])
        displayConvolist();
        return
    }

    // Online Users State Change
    if (event == 'userStateChange'){
        const {user, state} = data
        toggleUserStatus(user, state)
    }


    // New Message
    if (event == 'new Message'){
        let msgTime = moment().format()
        if (data.success){
            let convo = singleConvo(currentChat.id, currentChat.participant, data.data.msg, false, mainUser, msgTime)
            conversationList = conversationMerge(conversationList, [convo])
            displayConvolist()
            let newmessage = newSentMsg(convo.lastMessage)
            //append to chat box and scroll to location
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            // Error to show Unable to send
            console.log(`nothing`)
        }
    }

    if (event == 'SETMSGASREAD'){
        let messageIndex = conversationList.findIndex(conversation => data == conversation.id);
        conversationList[messageIndex]['lastMessage']['read'] = true;
        displayConvolist()
    }

})

WorkerIO.port.addEventListener('message', function(eventM){
    console.log('OnMessage:', eventM.data);
    let { event, data } = eventM.data

    if (event == 'NEWSESSION'){
        mainUser = data
        // console.log('mainuser is: ',mainUser)
        // make an ajax call to get list of all your users
        toggleConnStatus(true)
        fetch(`/conversations`)
            .then(res => res.json())
                .then(connectedUsers => {
                    usersElem.innerHTML = "";
                    if (!connectedUsers.length) return
                    conversationList = connectedUsers.reverse();
                    displayConvolist(true)
                    getOnlineUsers()
                    
                })
                return
    }

    if (event == 'getonlineUsers'){
        if (!data) return
        data.forEach(onlineuser => {
            toggleUserStatus(onlineuser, true);
            return
        })
    }

});



WorkerIO.port.addEventListener('error', function(e){
  throw new Error('WorkerIO Error: could not open SharedWorker', e);
}, false);


// create classes for create message, create user

let chatEvent = (chat) => {
    return ()=>{
        if (currentChat.id != chat.id){
            setCurrentChat(chat);
        }
    }
}

const setCurrentChat = (chat) => {

    // remove previous user highlight
    if(currentChat){
        removePrevConvo(currentChat);
    }

    currentChat = chat;

    // inform sharedworker
    WorkerIO.port.postMessage({event: 'SETCURRENTUSER', data: {cid: currentChat.id, tab: tabId } })

    //set new chat as selected
    loadConversation(currentChat)

    // clear chatbox
    chatBox.innerHTML = ""

    // Set receiver element
    let {participant, id, lastMessage } = currentChat;

    // clear unread notification
    // set message as read in store using id and tell server i read all conversations
    if (lastMessage.sender == participant && !lastMessage.read ){
        setReadChat(id)
    }
    
    receiverElem.innerText = `Message: ${participant}`;

    fetchMessages(id)

}

const setReadChat = (id) => {
    console.log('setting read chat in store')
    WorkerIO.port.postMessage({event: 'MESSAGEREAD', data: id})
}

const fetchMessages = (id, timestamp = null) => {
    let messageURL = timestamp == null ? `/currentchat/${id}` : `/currentchat/${id}/${timestamp}`
    fetch(messageURL)
    .then(res => res.json())
        .then(data => {
            data.forEach(messages => {
                const { sender } = messages;
                let newmessage = sender == currentChat.participant ? newReceivedMsg(messages) : newSentMsg(messages)
                chatBox.appendChild(newmessage)
            })
        })
        chatBox.scrollTop = chatBox.scrollHeight;
}


const getOnlineUsers = () => {
    WorkerIO.port.postMessage({ event: 'GETONLINEUSERS', data: tabId })
}



// Submitting and sending Message
messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const msg = e.target.elements[0].value;
    if (!msg){
        return
    }
    let msgTime = moment().format();

    //emit message to user
    WorkerIO.port.postMessage({ event: 'new Message', data: { cid: currentChat.id, msg: msg, sender: mainUser, recipient: currentChat.participant, timestamp: msgTime } })

    e.target.elements[0].value = '';
    e.target.elements[0].focus();
})

WorkerIO.port.start();

