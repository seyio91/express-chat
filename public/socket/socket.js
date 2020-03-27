console.log('Script reads')
const usersElem = document.getElementById("users");
const receiverElem = document.getElementById("recipient");
const sendMessage = document.getElementById("sendMessage");
const messageForm = document.getElementById('messageForm');
const socket = io();

currentChat = null;

socket.emit('new session', ()=>{
    
})

socket.on('onlineusers', users => {
    console.log(users)
    console.log(socket.id)
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
    //emit message to user
    socket.emit('new Message', {receipt: currentChat, msg: msg})

    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})
