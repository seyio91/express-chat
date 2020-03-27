console.log('Script reads')
const usersElem = document.getElementById("users");
const socket = io();


socket.emit('new session', ()=>{
    
})

socket.on('onlineusers', users => {
    console.log(users)
    usersElem.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(user));
        li.setAttribute('class', 'list-group-item');
        usersElem.appendChild(li)
    })
    
})