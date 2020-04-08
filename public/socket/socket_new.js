const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const socket = io();
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, clearUnreadMessage,
        notifyUnreadMsg, updateConvoList, toggleConnStatus,
        setUsersOffline } from './socket-helpers.js'

const WorkerIO = new SharedWorker('/js/shared_worker.js', 'NDN-Worker');

// console.log('WorkerIO:', WorkerIO);

WorkerIO.port.addEventListener('message', function(eventM){
  console.log('OnMessage:', eventM.data);
});

WorkerIO.port.start();
// WorkerIO.port.postMessage('This is a message from the client!');

WorkerIO.port.addEventListener('error', function(e){
  throw new Error('WorkerIO Error: could not open SharedWorker', e);
}, false);


// create classes for create message, create user

let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
// let lastOffline = "2020-04-02T08:12:03+08:00";

const setCurrentChat = (chat) => {

    // remove previous user highlight
    if(currentChat){
        removePrevConvo(currentChat);
    }

    currentChat = chat;

    //set new chat as selected
    loadConversation(currentChat)

    chatBox.innerHTML = ""

    // Set receiver element
    let {participant, id } = currentChat;

    // clear unread notification
    clearUnreadMessage(participant)

    receiverElem.innerText = `Message: ${participant}`;

    // Load chat for new Current Chat Ajax request for current Chat
    fetch(`/currentchat/${id}`)
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

socket.emit('new session', (data)=>{
    mainUser = data
    // console.log('mainuser is: ',mainUser)
    // make an ajax call to get list of all your users
    toggleConnStatus(true)
    fetch(`/conversations`)
        .then(res => res.json())
            .then(connectedUsers => {
                usersElem.innerHTML = "";
                if (!connectedUsers.length){
                    return
                }
                // conversationList = connectedUsers;
                connectedUsers.forEach((user, index) => {
                    let { uid1, uid2, id, lastMessage } = user;
                    let participant = mainUser == uid1 ? uid2 : uid1
                    let contactWrapper = getUserTab(lastMessage, participant)
                    let chat = {participant, id}
                    contactWrapper.addEventListener('click',(chatEvent)(chat))
                    usersElem.appendChild(contactWrapper)
                    if (index == 0){
                        setCurrentChat(chat)
                    }
                })
                getOnlineUsers()
            
            })
        
})


const getOnlineUsers = () => {
    socket.emit('getonlineUsers', (data)=>{
        data.forEach(onlineuser => {
            toggleUserStatus(onlineuser, true)
        })
    })
}

socket.on('connect', ()=>{
    if(timerId != null){
        clearTimeout(timerId)
        timerId = null
        toggleConnStatus(true)

        // check for messages while you were offline
        if (lastOffline == null){
            return
        }
        fetch(`/conversations/${lastOffline}`)
            .then(res => res.json())
                .then(updatedMessages=> {
                    if(!updatedMessages.length){
                        return
                    }
                    updatedMessages.forEach(conversation => {
                        //no need to check the user. definitely does not belong to me
                        // for each message, get last message sender
                        let message = conversation.lastMessage
                        // update the UI
                        const { sender } = message;

                        // check if Message is new conversation
                        // if the User does not exist
                        // create a new conversation
                        // add click event
                        // append to user list
                        let testdoc = document.getElementById(sender)
                        if (testdoc == null){
                            let { id } = conversation;
                            let contactWrapper = getUserTab(message, sender)
                            let chat = {sender, id}
                            contactWrapper.addEventListener('click',(chatEvent)(chat))
                            usersElem.appendChild(contactWrapper)
                        } else {
                            updateConvoList(message, sender)
                            if (currentChat.participant == sender){
                                let newmessage = newReceivedMsg(message)
                                // Append to Chat and Scroll down
                                chatBox.appendChild(newmessage)
                                chatBox.scrollTop = chatBox.scrollHeight;
                        
                            } else {    
                                // Show notification if you are not currentchat
                                notifyUnreadMsg(sender)
                            }
                        }
 


                    })
                })
                if (currentChat){
                    getOnlineUsers()
                }

        lastOffline = null
    }
})

socket.on('receive Message', (data)=>{

    const { sender } = data;
    updateConvoList(data, sender)
    if (currentChat.participant == sender){
        let newmessage = newReceivedMsg(data)
        // Append to Chat and Scroll down
        chatBox.appendChild(newmessage)
        chatBox.scrollTop = chatBox.scrollHeight;

    } else {    
        // Show notification if you are not currentchat
        notifyUnreadMsg(sender)
    }
    // updateConvoList(data, sender)
})

// handle user state change
socket.on('userStateChange', (userdetails) => {
    const {user, state} = userdetails
    toggleUserStatus(user, state)
})


socket.on('disconnect', ()=> {
    timerId = setTimeout(() => {
        
        console.log("never happens");
        toggleConnStatus(false)
        setUsersOffline()
        // lastOffline = moment().format()
        lastOffline = "2020-04-02T08:12:03+08:00"
        console.log('my last time offline in this session', lastOffline)
    }, 3000);
    // toggleConnStatus(false)
    // set all users as offline
    // setUsersOffline()
})


let chatEvent = (chat) => {
    return ()=>{
        if (currentChat !== chat){
            setCurrentChat(chat) 
        }
    }
}


// Submitting and sending Message
messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const msg = e.target.elements[0].value;
    if (!msg){
        return
    }

    let msgTime = moment().format()

    //emit message to user
    socket.emit('new Message', { cid: currentChat.id, msg: msg, recipient: currentChat.participant, timestamp: msgTime }, (success)=>{
        if (success){

            let genMsg = { message: msg, sender:mainUser, timestamp: msgTime}
            let newmessage = newSentMsg(genMsg)
            //append to chat box and scroll to location
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;
            updateConvoList(genMsg, currentChat.participant)

        } else {
            // Error to show Unable to send
            console.log(`nothing`)
        }
    })

    e.target.elements[0].value = '';
    e.target.elements[0].focus();
})


