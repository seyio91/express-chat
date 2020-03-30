console.log('Script reads')
const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chat = document.getElementById('chat');
const socket = io();

// create classes for create message, create user

currentChat = null;
mainUser = null;


const setCurrentChat = (chat) => {
    currentChat = chat;

    // Other Actions anytime a current chat is changed
    console.log(`actions for current chat changing to `, currentChat )

    // Set receiver element
    receiverElem.innerText = currentChat;

    // Load chat for new Current Chat
}

const loadCurrentChatMessages = () => {

}

socket.emit('new session', (data)=>{
    console.log(data)
    // make an ajax call to get list of all your users
    fetch(`/chatusers`)
        .then(res => res.json())
            .then(connectedUsers => {
                // console.log(connectedUsers);
                usersElem.innerHTML = "";
                if (!connectedUsers.length){
                    return
                }
                connectedUsers.forEach((user, index) => {
                    if (index == 0){
                        // currentChat = user;
                        setCurrentChat(user)
                    }
                    const li = document.createElement('li');
                    li.appendChild(document.createTextNode(user));
                    li.setAttribute('class', 'list-group-item');
                    li.addEventListener('click',(chatEvent)(user))
                    usersElem.appendChild(li)
                })     
            
            })


    // let { userid, connectedUsers} = data;
    // mainUser = userid
    // usersElem.innerHTML = "";
    // if (!connectedUsers.length){
    //     return
    // }
    // connectedUsers.forEach((user, index) => {
    //     if (index == 0){
    //         currentChat = user;
    //     }
    //     const li = document.createElement('li');
    //     li.appendChild(document.createTextNode(user));
    //     li.setAttribute('class', 'list-group-item');
    //     li.addEventListener('click',(chatEvent)(user))
    //     usersElem.appendChild(li)
    // })
})


socket.on('receive Message', (data)=>{
    console.log(data)
    //Add Messages to DOM
    const { message, sender } = data;
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(`${sender}:    ${message}`))
    div.setAttribute('class', 'card bg-light')
    chat.appendChild(div)

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
        if (currentChat != chat){
            // currentChat = chat;
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

    // Add to DOM. options are using an already set user from initial login(can be changed by client)
    // Or Add using the Callback from emit user.. Not an issue for display purposes. Will be removed later no user displayed
    //Add Messages to DOM
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(`${mainUser}:    ${msg}`))
    div.setAttribute('class', 'card text-white bg-dark')
    chat.appendChild(div)
    

    //emit message to user
    socket.emit('new Message', {recipient: currentChat, msg: msg})



    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})
