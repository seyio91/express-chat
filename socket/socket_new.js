

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
                outputhtml = ""
                data.forEach(messages => {
                    const { message, sender, timestamp } = messages;
                    if (sender == currentChat.participant){
                        innerhtml = `
                    <div class="media w-50 mb-3">
                    <div class="media-body ml-3">
                      <div class="bg-light rounded py-2 px-3 mb-2">
                        <p class="text-small mb-0 text-muted">${message}</p>
                      </div>
                      <p class="small text-muted">${timestamp}</p>
                    </div>
                  </div>
                        `
                    } else {
                        innerhtml = `
                        <div class="media w-50 ml-auto mb-3">
                        <div class="media-body">
                          <div class="bg-primary rounded py-2 px-3 mb-2">
                            <p class="text-small mb-0 text-white">${message}</p>
                          </div>
                          <p class="small text-muted">12:00 PM | Aug 13</p>
                        </div>
                      </div>
                        `
                    }
                    outputhtml += innerhtml;


                    // const { message, sender, timestamp } = messages;
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
    const mainUser = data
    // make an ajax call to get list of all your users
    fetch(`/conversations`)
        .then(res => res.json())
            .then(connectedUsers => {
                // console.log(connectedUsers);
                usersElem.innerHTML = "";
                if (!connectedUsers.length){
                    return
                }
                connectedUsers.forEach((user, index) => {
                    let { uid1, uid2, id, lastMessage } = user;
                    let participant = mainUser == uid1 ? uid2 : uid1

                    let contact = `
                    <a href="#" class="list-group-item list-group-item-action list-group-item-light rounded-0" id="${participant}">
                    <div class="media"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" class="rounded-circle" width="50">
                      <div class="media-body ml-4">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                          <h6 class="mb-0">${participant}</h6><small class="small font-weight-bold">21 Aug</small>
                        </div>
                        <p class="font-italic text-muted mb-0 text-small">${lastMessage}</p>
                      </div>
                    </div>
                  </a>
                    `

                    // const li = document.createElement('li');
                    // li.appendChild(document.createTextNode(participant));
                    // li.setAttribute('class', 'list-group-item text-danger');
                    // li.setAttribute('id', `${participant}`);
                    let chat = {participant, id}
                    // li.addEventListener('click',(chatEvent)(chat))
                    contact.addEventListener('click',(chatEvent)(chat))
                    // usersElem.appendChild(li)
                    usersElem.appendChild(contact)
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
                            // userElem.setAttribute('class', 'list-group-item text-success');
                            currClass = userElem.getAttribute('class');
                            userElem.setAttribute('class', `${currClass} text-success`)
                        }
                    })
                })
            
            })
        
})


socket.on('receive Message', (data)=>{
    // console.log(data)
    //Add Messages to DOM
    const { message, sender, timestamp } = data;

    

    if (currentChat.participant == sender){
        newmessage = `
            <div class="media w-50 mb-3">
                <div class="media-body ml-3">
                    <div class="bg-light rounded py-2 px-3 mb-2">
                        <p class="text-small mb-0 text-muted">${message}</p>
                    </div>
                    <p class="small text-muted">${timestamp}</p>
                </div>
            </div> 
        `
        // const div = document.createElement('div')
        // div.appendChild(document.createTextNode(`${sender}:    ${message}`))
        // div.setAttribute('class', 'card bg-dark text-light')
        // chat.appendChild(div)
        chatBox.appendChild(newmessage)

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

        currClass = userElem.getAttribute('class');
        if (!state){
            // userElem.setAttribute('class', 'list-group-item text-danger');

            
            currClass = currClass.replace(' text-success', '')
            userElem.setAttribute('class', `${currClass} text-danger`)
        } else {

            // userElem.setAttribute('class', 'list-group-item text-success');
            currClass = currClass.replace(' text-danger', '')
            userElem.setAttribute('class', `${currClass} text-success`)
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

    // const div = document.createElement('div')
    // div.appendChild(document.createTextNode(`${mainUser}:    ${msg}`))
    // div.setAttribute('class', 'card bg-light')
    newmessage =   `
        <div class="media w-50 ml-auto mb-3">
            <div class="media-body">
            <div class="bg-primary rounded py-2 px-3 mb-2">
                <p class="text-small mb-0 text-white">${msg}</p>
            </div>
            <p class="small text-muted">12:00 PM | Aug 13</p>
            </div>
        </div>
    `

    chatBox.appendChild(div)
}