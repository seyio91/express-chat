console.log('Script reads')
const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const socket = io();
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, clearUnreadMessage,
        notifyUnreadMsg, timeDisplayHandler, updateConvoList } from './socket-helpers.js'

// create classes for create message, create user

let currentChat = null;
let mainUser = null;


let sometime = timeDisplayHandler("2020-03-01T08:12:10+08:00")
console.log(sometime)

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

    receiverElem.innerText = participant;

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
    console.log('mainuser is: ',mainUser)
    // make an ajax call to get list of all your users
    fetch(`/conversations`)
        .then(res => res.json())
            .then(connectedUsers => {
                usersElem.innerHTML = "";
                if (!connectedUsers.length){
                    return
                }
                connectedUsers.forEach((user, index) => {
                    let { uid1, uid2, id, lastMessage } = user;
                    let participant = mainUser == uid1 ? uid2 : uid1
                    let contactWrapper = getUserTab(participant, lastMessage)
                    let chat = {participant, id}
                    contactWrapper.addEventListener('click',(chatEvent)(chat))
                    usersElem.appendChild(contactWrapper)
                    if (index == 0){
                        setCurrentChat(chat)
                    }
                })
                socket.emit('getonlineUsers', (data)=>{
                    data.forEach(onlineuser => {
                        toggleUserStatus(onlineuser, true)
                    })
                })
            
            })
        
})


socket.on('receive Message', (data)=>{

    const { sender } = data;
    if (currentChat.participant == sender){
        let newmessage = newReceivedMsg(data)
        // Append to Chat and Scroll down
        chatBox.appendChild(newmessage)
        chatBox.scrollTop = chatBox.scrollHeight;

    } else {    
        // Show notification if you are not currentchat
        notifyUnreadMsg(sender)
    }
    updateConvoList(data, currentChat.participant)

})

// handle user state change
socket.on('userStateChange', (userdetails) => {
    const {user, state} = userdetails
    toggleUserStatus(user, state)
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

    //emit message to user
    socket.emit('new Message', { cid: currentChat.id, msg: msg, recipient: currentChat.participant }, (success)=>{
        if (success){

            let genMsg = { message: msg, sender:mainUser, timestamp: moment().format()}
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


