const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
// const newchat = document.getElementById('newchat');
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, clearUnreadMessage,
        notifyUnreadMsg, updateConvoList, toggleConnStatus,
        setUsersOffline, renderConvoList } from './socket-helpers.js'


// chat new
$("#newchat").click(function() {
    $(".side-two").css({
      "left": "0"
    });
});

// return
$("#returnchat").click(function() {
    $(".side-two").css({
      "left": "-100%"
    });
  });


// import passport from 'passport';

// const WorkerIO = new SharedWorker('shared_worker.js', 'NDN-Worker');
let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
let conversationList = [];

WorkerIO.port.addEventListener('message', function(eventM){
    console.log('OnMessage:', eventM.data);
    let { event, data } = eventM.data

    if (event == 'new session'){
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

                    conversationList = connectedUsers;
                    connectedUsers.forEach((user, index) => {
                        console.log(user)
                        let { uid1, uid2, id, lastMessage } = user;
                        let participant = mainUser == uid1 ? uid2 : uid1
                        // let {message, sender, timestamp} = lastMessage
                        // populate conversation list for user
                        // conversationList.push({id, name: participant, message, sender, timestamp })

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
                        if(!updatedMessages.length){
                            return
                        }

                        // render the whole list and display
                        updatedMessages.forEach(conversation => {
                            let message = conversation.lastMessage
                            const { sender } = message;
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
                                    fetchMessages(currentChat.id, lastOffline)
                            
                                } else {    
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
        return
    }
  
  
    if (event == 'receive Message'){
        const { sender, cid, message, timestamp } = data;
        conversationList = renderConvoList(conversationList, cid, { message, sender, timestamp })
        usersElem.innerHTML = "";
        conversationList.forEach((convo, index) => {
            const { id, uid1, uid2 } = convo
            let participant = mainUser == uid1 ? uid2 : uid1
            const {message, sender, timestamp} = convo.lastMessage
            let contactWrapper = getUserTab({ message, sender, timestamp }, participant)
            let chat = { participant, id }
            contactWrapper.addEventListener('click',(chatEvent)(chat))
            usersElem.appendChild(contactWrapper)
            if (currentChat.id == id) {
                loadConversation(currentChat)
            }
        })

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

            let genMsg = { message: data.data.msg, sender:mainUser, timestamp: msgTime}
            conversationList = renderConvoList(conversationList, currentChat.id, genMsg)
            let newmessage = newSentMsg(genMsg)
            //append to chat box and scroll to location
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;
            // render
            usersElem.innerHTML = "";
            conversationList.forEach((convo, index) => {
                const { id, uid1, uid2 } = convo
                let participant = mainUser == uid1 ? uid2 : uid1
                const {message, sender, timestamp} = convo.lastMessage
                let contactWrapper = getUserTab({ message, sender, timestamp }, participant)
                let chat = { participant, id }
                contactWrapper.addEventListener('click',(chatEvent)(chat))
                usersElem.appendChild(contactWrapper)
                if (currentChat.id == id) {
                    loadConversation(currentChat)
                }
            })
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
    return ()=>{
        if (currentChat !== chat){
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

    chatBox.innerHTML = ""

    // Set receiver element
    let {participant, id } = currentChat;

    // clear unread notification
    clearUnreadMessage(participant)

    receiverElem.innerText = `Message: ${participant}`;

    fetchMessages(id)

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
    WorkerIO.port.postMessage({ event: 'new Message', data: { cid: currentChat.id, msg: msg, recipient: currentChat.participant, timestamp: msgTime } })

    e.target.elements[0].value = '';
    e.target.elements[0].focus();
})




WorkerIO.port.start();