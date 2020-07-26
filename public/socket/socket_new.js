const usersElem = document.getElementById("users");
const alluserElem = document.getElementById("allusers");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const newchat = document.getElementById('newchat');
const newchatlist = document.querySelector('.side-two');
const returnchat = document.getElementById('returnchat');
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, clearUnreadMessage,
        notifyUnreadMsg, updateConvoList, toggleConnStatus,
        setUsersOffline, renderConvoList, newUserTab,
        conversationMerge } from './socket-helpers.js'


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

// import passport from 'passport';

// const WorkerIO = new SharedWorker('shared_worker.js', 'NDN-Worker');
let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
let conversationList = [];


const displayConvolist = (firstload = false) => {
    console.log(conversationList);
    usersElem.innerHTML = "";
    conversationList.forEach((user, index) => {
        let { uid1, uid2, id, lastMessage } = user;
        let participant = mainUser == uid1 ? uid2 : uid1;
        let contactWrapper = getUserTab(lastMessage, participant)
        let chat = {participant, id, lastMessage}
        contactWrapper.addEventListener('click',(chatEvent)(chat))
        usersElem.appendChild(contactWrapper)
        if (firstload) {
            if (index == 0){
                setCurrentChat(chat)
            }
        }
    })
    if (! firstload) loadConversation(currentChat)
}


WorkerIO.port.addEventListener('message', function(eventM){
    console.log('OnMessage:', eventM.data);
    let { event, data } = eventM.data

    if (event == 'new session'){
        mainUser = data
        console.log('mainuser is: ',mainUser)
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
        data.forEach(onlineuser => {
            toggleUserStatus(onlineuser, true);
            return
        })
    }

    if (event == 'connect'){
        if(timerId != null){
            clearTimeout(timerId)
            timerId = null
            toggleConnStatus(true)
    
            // Check If user was offline or just a page refresh
            // return if offline is less than one second
            if (lastOffline == null){
                return
            }
 
            // Return Messages after last time offline
            fetch(`/conversations/${lastOffline}`)
                .then(res => res.json())
                    .then(updatedMessages=> {
                        if(!updatedMessages.length) return
                        // render the whole list and display
                        conversationList = conversationMerge(conversationList, updatedMessages)
                        displayConvolist()
                    })
                    if (currentChat){
                        getOnlineUsers()
                    }
    
            lastOffline = null
        }
        
        return
    }
  
  
    if (event == 'receive Message'){
        const { sender, cid, message, timestamp, read } = data;
        conversationList = renderConvoList(conversationList, cid, { message, sender, timestamp, read })
        displayConvolist();
        if (currentChat.participant == sender){
            let newmessage = newReceivedMsg(data)
            // Append to Chat and Scroll down
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;
    
        } else {    
            // Show notification if you are not currentchat
            notifyUnreadMsg(sender)
        }
        return
    }

    if (event == 'userStateChange'){
        const {user, state} = data
        toggleUserStatus(user, state)
    }

    if (event == 'disconnect'){
        timerId = setTimeout(() => {
            toggleConnStatus(false)
            setUsersOffline()
            // lastOffline = moment().format()
            lastOffline = "2020-04-02T08:12:03+08:00"
            console.log('my last time offline in this session', lastOffline)
        }, 3000);
    }

    if (event == 'new Message'){
        let msgTime = moment().format()
        if (data.success){
            console.log(data)
            let genMsg = { message: data.data.msg, sender:mainUser, timestamp: msgTime, read: true}
            conversationList = renderConvoList(conversationList, currentChat.id, genMsg)
            let newmessage = newSentMsg(genMsg)
            //append to chat box and scroll to location
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;
            // render
            displayConvolist()
        } else {
            // Error to show Unable to send
            console.log(`nothing`)
        }
    }

});



WorkerIO.port.addEventListener('error', function(e){
  throw new Error('WorkerIO Error: could not open SharedWorker', e);
}, false);


// create classes for create message, create user

let chatEvent = (chat) => {
    let { id } = chat;
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

    //set new chat as selected
    loadConversation(currentChat)

    // clear chatbox
    chatBox.innerHTML = ""

    // Set receiver element
    let {participant, id, lastMessage } = currentChat;

    // clear unread notification
    // set message as read in store using id and tell server i read all conversations
    setReadChat(id)

    // emit read message to server if last message was unread
    if (!lastMessage.read){
        readMessageEmitter()
    }
    
    clearUnreadMessage(participant)

    receiverElem.innerText = `Message: ${participant}`;

    fetchMessages(id)

}

const setReadChat = id => {
    console.log('setting read chat in store')

}

const readMessageEmitter = () => {
    console.log('emitting sent message')
}

const fetchMessages = (id, timestamp = null) => {
    let messageURL = timestamp == null ? `/currentchat/${id}` : `/currentchat/${id}/${timestamp}`
    fetch(messageURL)
    .then(res => res.json())
        .then(data => {
            data.forEach(messages => {
                const { sender } = messages;
                let newmessage = null
                if (sender == currentChat.participant){

                    newmessage = newReceivedMsg(messages)

                } else {

                    newmessage = newSentMsg(messages)

                }
                chatBox.appendChild(newmessage)
            })
        })
        chatBox.scrollTop = chatBox.scrollHeight;
}


const getOnlineUsers = () => {
    WorkerIO.port.postMessage({ event: 'getonlineUsers', data: '' })
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
    // WorkerIO.port.postMessage({ event: 'new Message', data: { cid: currentChat.id, msg: msg, recipient: currentChat.participant, timestamp: msgTime } })
    WorkerIO.port.postMessage({ event: 'new Message', data: { cid: currentChat.id, msg: msg, sender: mainUser, timestamp: msgTime } })

    e.target.elements[0].value = '';
    e.target.elements[0].focus();
})

WorkerIO.port.start();