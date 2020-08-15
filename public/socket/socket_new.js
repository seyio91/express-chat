const usersElem = document.getElementById("users");
const alluserElem = document.getElementById("allusers");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const newchat = document.getElementById('newchat');
const newchatlist = document.querySelector('.side-two');
const returnchat = document.getElementById('returnchat');
import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, toggleConnStatus,
        setUsersOffline, newUserTab,conversationMerge, singleConvo } from './socket-helpers.js'


let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
let conversationList = [];
const tabId = uuid.v4();
let timerInterval = null


const createConversationList = (conversation) => {
    return conversation.map(convo => {
        let { uid1, uid2, id, lastMessage } = convo;
        let participant = mainUser == uid1 ? uid2 : uid1;
        return {
            id,
            status: false,
            newchat: false,
            participant,
            lastMessage
        }
    })
}

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
                // console.log(allUsers)
                allUsers.forEach(user => {
                    // check if user is not current user
                    if (user.email != mainUser){
                        // render chat page
                        let contactWrapper = newUserTab(user)
                        contactWrapper.addEventListener('click',(newChatEvent)(user))
                        alluserElem.appendChild(contactWrapper)
                    }
                })
            })
})

// return chat list
returnchat.addEventListener('click', ()=>{
    drawBackNew()
})

const drawBackNew = () => {
    newchatlist.style.left = '-100%';
    setTimeout(()=>{
        alluserElem.innerHTML = "";
    }, 200)
}


// new chat event
let newChatEvent = (userid) => {
    return ()=>{
        let userChat
        // search through conversationList- participant
        let index = conversationList.findIndex(conversation => conversation.uid1 == userid.email || conversation.uid2 == userid.email)
        if (index != -1){
            userChat = conversationList[index]
            let chatItem = {id: userChat.id, participant: userid.email, lastMessage: userChat.lastMessage, newchat: false}
            if (currentChat.id != userChat.id) setCurrentChat(chatItem);
        } else {
            newCurrentChat({ id: uuid.v4(),participant: userid.email, newchat: true })
        }
        drawBackNew() 
    }
}




const displayConvolist = (firstload = false) => {
    usersElem.innerHTML = "";
    let indexChat = null
    conversationList.forEach((user, index) => {
        let { participant, status, lastMessage } = user;
        let contactWrapper = getUserTab(lastMessage, participant, status)
        contactWrapper.addEventListener('click',(chatEvent)(user))
        usersElem.appendChild(contactWrapper)
        if (index == 0) indexChat = user
    })
    if (! firstload) {
        if (currentChat) loadConversation(currentChat)
    } else {
        // chat for first conversation
        setCurrentChat(indexChat)
    }
}

WorkerIO.port.postMessage({ event: 'SWCONNECTED', data: tabId })


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
    
            // Check If user was offline or just a page refresh
            // return if offline is less than one second
            if (lastOffline == null) return
            toggleConnStatus(true)
 
            // Return Messages after last time offline
            fetch(`/conversations/${lastOffline}`)
                .then(res => res.json())
                    .then(updatedMessages=> {
                        if(!updatedMessages.length) return
                        // render the whole list and display
                        let updatedConvo = createConversationList(connectedUsers);
                        conversationList = conversationMerge(conversationList, updatedConvo)
                        let messageIndex = updatedMessages.findIndex(conversation => currentChat.id == conversation.id)
                        if (messageIndex != -1){
                            setReadChat(currentChat.id)
                            fetchMessages(currentChat.id, lastOffline)
                        }
                        displayConvolist()
                    })
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
        }, 3000);
    }

    // RECEIVE_MESSAGES
    if (event == 'RECEIVE_MESSAGE'){
        // issue with bold on currentuser
        const { sender, cid, message, read, timestamp } = data;
        if (currentChat && currentChat.id == cid){
            let newmessage = newReceivedMsg(data)
            chatBox.appendChild(newmessage)
            chatBox.scrollTop = chatBox.scrollHeight;    
        }
        
        let convo = singleConvo(cid, sender, message, read, sender, timestamp)
        console.log('convo before message')
        console.log(conversationList)
        conversationList = conversationMerge(conversationList, [convo])
        console.log('convo After message')
        console.log(conversationList)
        displayConvolist();
        return
    }

    // Online Users State Change
    if (event == 'userStateChange'){
        const {user, state} = data
        toggleUserStatus(user, state)
    }


    // NEWMESSAGE
    if (event == 'NEWMESSAGE'){
        if (data.success){
            let { msg, timestamp } = data.data
            currentChat.lastMessage = { message: msg, read: false, sender:mainUser, timestamp }
            conversationList = conversationMerge(conversationList, [currentChat])
            displayConvolist()
            if (currentChat.id == data.data.cid){
                let newmessage = newSentMsg(currentChat.lastMessage)
                chatBox.appendChild(newmessage)
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            console.log(conversationList)
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
        toggleConnStatus(true)
        fetch(`/conversations`)
            .then(res => res.json())
                .then(connectedUsers => {
                    usersElem.innerHTML = "";
                    if (!connectedUsers.length) return
                    conversationList = createConversationList(connectedUsers).reverse();
                    displayConvolist(true)
                    
                })
                return
    }

    if (event == 'GETONLINEUSER'){
        if (!data) {
            // do something with false
            document.getElementById('user-status').innerText = 'Status: Offline'
        } else {
            // do something with true
            document.getElementById('user-status').innerText = 'Status: Online'
        }
        // data.forEach(onlineuser => {
        //     toggleUserStatus(onlineuser, true);
        //     return
        // })
    }

});



WorkerIO.port.addEventListener('error', function(e){
  throw new Error('WorkerIO Error: could not open SharedWorker', e);
}, false);


let chatEvent = (chat) => {
    return ()=>{
        console.log(chat)
        if (currentChat.id != chat.id){
            setCurrentChat(chat);
        }
    }
}

const newCurrentChat = (chat) => {

    if(currentChat && !currentChat.newchat){
        removePrevConvo(currentChat);
    }

    currentChat = chat;

    chatBox.innerHTML = ""

    WorkerIO.port.postMessage({event: 'SETCURRENTUSER', data: {cid: currentChat.id, tab: tabId } })

    let { participant } = currentChat;

    receiverElem.innerText = `Message: ${participant}`;
}

const setCurrentChat = (chat) => {

    // remove previous user highlight
    if(currentChat && !currentChat.newchat){
        removePrevConvo(currentChat);
    }

    currentChat = chat;
    // console.log(currentChat)

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
    if (lastMessage.sender == participant && !lastMessage.read ) setReadChat(id)
    
    
    receiverElem.innerText = `Message: ${participant}`;

    // Get Online Status
    
    // if (timerInterval) clearInterval(timerInterval)
    getOnlineUser(participant)
    // timerInterval = setInterval(() => {
    //     getOnlineUser(participant)
    // }, 6000);

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


const getOnlineUser = (participant) => {
    WorkerIO.port.postMessage({ event: 'GETONLINEUSER', data: { tabId, participant } })
}



// Submitting and sending Message
messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const msg = e.target.elements[0].value;
    if (!msg) return
    let msgTime = moment().format();

    //emit message to user
    WorkerIO.port.postMessage({ event: 'NEWMESSAGE', data: { cid: currentChat.id, msg: msg, sender: mainUser, recipient: currentChat.participant, timestamp: msgTime, newchat:currentChat.newchat } })

    e.target.elements[0].value = '';
    e.target.elements[0].focus();
})

WorkerIO.port.start();

