

console.log('Script reads')
const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chat');
const socket = io();

// create classes for create message, create user

currentChat = null;
mainUser = null;


const setCurrentChat = (chat) => {
    currentChat = chat;
    chatBox.innerHTML = ""

    // Set receiver element
    let {participant, id } = currentChat;

    // clear unread notification
    let userdiv = document.getElementById(participant)
    userdiv.className = userdiv.className.replace(' bg-warning' ,'')


    // Other Actions anytime a current chat is changed
    console.log(`actions for current chat changing to `, currentChat )



    receiverElem.innerText = participant;
    console.log('participant is: ', participant)

    // Load chat for new Current Chat Ajax request for current Chat
    fetch(`/currentchat/${id}`)
        .then(res => res.json())
            .then(data => {
                data.forEach(messages => {

                    const { message, sender, timestamp } = messages;
                    // console.log('the sender: ', sender)
                    // console.log('the Message: ', message)
                    const div = document.createElement('div')
                    div.appendChild(document.createTextNode(`${sender}:    ${message}`))
                    let colorAtrribute =  sender == participant ? 'dark text-white' : 'light'  
                    div.setAttribute('class', `card bg-${colorAtrribute}`)
                    chatBox.appendChild(div)
                })
            })
}

// const loadCurrentChatMessages = () => {

// }

socket.emit('new session', (data)=>{
    mainUser = data
    // make an ajax call to get list of all your users
    fetch(`/conversations`)
        .then(res => res.json())
            .then(connectedUsers => {
                // console.log(connectedUsers);
                usersElem.innerHTML = "";
                console.log('code got here')
                if (!connectedUsers.length){
                    return
                }
                connectedUsers.forEach((user, index) => {
                    let { uid1, uid2, id, lastMessage } = user;
                    const li = document.createElement('li');
                    participant = mainUser == uid1 ? uid2 : uid1
                    li.appendChild(document.createTextNode(participant));
                    li.setAttribute('class', 'list-group-item text-danger');
                    li.setAttribute('id', `${participant}`);
                    let chat = {participant, id}
                    li.addEventListener('click',(chatEvent)(chat))
                    usersElem.appendChild(li)
                    if (index == 0){
                        setCurrentChat(chat)
                    }
                })
                console.log('checking code block')
                socket.emit('getonlineUsers', (data)=>{
                    console.log(data)
                    data.forEach(onlineuser => {
                        const userElem = document.getElementById(onlineuser)
                        if (userElem) {
                            userElem.setAttribute('class', 'list-group-item text-success');
                        }
                    })
                })
            
            })
        
})


socket.on('receive Message', (data)=>{
    // console.log(data)
    //Add Messages to DOM
    const { message, sender } = data;

    

    if (currentChat.participant == sender){
        const div = document.createElement('div')
        div.appendChild(document.createTextNode(`${sender}:    ${message}`))
        div.setAttribute('class', 'card bg-dark text-light')
        chatBox.appendChild(div)

        // scroll down on receive message
        chatBox.scrollTop = chatBox.scrollHeight;

    } else {
        
        // This show notification if you are not currentchat
        const userElem = document.getElementById(sender)
        if (userElem){
            userElem.className += ' bg-warning'
        }
    }
})

// handle user state change\
socket.on('userStateChange', (userdetails) => {
    const {user, state} = userdetails
    const userElem = document.getElementById(user)
    if (userElem){
        if (!state){
            userElem.setAttribute('class', 'list-group-item text-danger');
        } else {
            userElem.setAttribute('class', 'list-group-item text-success');
        }
    }
})



// // UI remove user if no one online
// socket.on('onlineuser', (msg) => {
//     console.log(msg)
//     socket.emit('test', 'getUsers', (users)=>{
//         if (!users){
//             return
//         }
//         console.log('should show other users')
//         console.log(users)
//         usersElem.innerHTML = "";
//         users.forEach((user, index) => {
//             if (index == 0){
//                 // currentChat = user;
//                 setCurrentChat(user)
//             }
//             const li = document.createElement('li');
//             li.appendChild(document.createTextNode(user));
//             li.setAttribute('class', 'list-group-item');
//             li.addEventListener('click',(chatEvent)(user))
//             usersElem.appendChild(li)
//         })
//     })
// })


chatEvent = (chat) => {
    return ()=>{
        if (currentChat !== chat){
            // console.log('currentchat passed in: ', chat)
            setCurrentChat(chat)
            console.log(currentChat)
            //tell socket that it is open, and receive chat messsages or use ajax calls to get message   
        }
    }
}

messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const msg = e.target.elements.message.value;
    if (!msg){
        return
    }
    console.log(msg)

    //emit message to user
    socket.emit('new Message', { cid: currentChat.id, msg: msg, recipient: currentChat.participant }, (success)=>{
        if (success){
            console.log(`${mainUser} sent the Message ${msg} to participant  ${currentChat.participant}   in cid:  ${currentChat.id}`)
            addChatToScreen(msg)
        } else {
            console.log(`nothing`)
        }
    })

    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})

const addChatToScreen = msg => {
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(`${mainUser}:    ${msg}`))
    div.setAttribute('class', 'card bg-light')
    chatBox.appendChild(div)
    
    // scroll down on receive message
    chatBox.scrollTop = chatBox.scrollHeight;
}