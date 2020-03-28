console.log('Script reads')
const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const messageForm = document.getElementById('messageForm');
const chat = document.getElementById('chat');
const socket = io();

// create classes for create message, create user

currentChat = null;

socket.emit('new session', (users)=>{
    console.log(`other users for my new session ${users}`)
    usersElem.innerHTML = "";
    users.forEach((user, index) => {
        if (index == 0){
            currentChat = user;
        }
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(user));
        li.setAttribute('class', 'list-group-item');
        li.addEventListener('click',(chatEvent)(user))
        usersElem.appendChild(li)
    })
    receiverElem.innerText = currentChat;
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


socket.on('onlineuser', (msg) => {
    console.log(msg)
    socket.emit('test', 'getUsers', (users)=>{
        console.log('should show other users')
        console.log(users)
        usersElem.innerHTML = "";
        users.forEach((user, index) => {
            if (index == 0){
                currentChat = user;
            }
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(user));
            li.setAttribute('class', 'list-group-item');
            li.addEventListener('click',(chatEvent)(user))
            usersElem.appendChild(li)
        })
        receiverElem.innerText = currentChat;
    })
})


chatEvent = (chat) => {
    return ()=>{
        if (currentChat != chat){
            currentChat = chat;
            console.log(currentChat)
            //set title header to chat
            receiverElem.innerText = currentChat;
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

    //Add to DOM


    //emit message to user
    socket.emit('new Message', {recipient: currentChat, msg: msg})



    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})
