import { getUserTab, newReceivedMsg, newSentMsg, toggleUserStatus,
        removePrevConvo, loadConversation, clearUnreadMessage,
        notifyUnreadMsg, updateConvoList, toggleConnStatus,
        setUsersOffline, renderConvoList } from './socket-helpers.js'


class UI {
    constructor(user) {
        this.usersElem = document.getElementById("users");
        this.receiverElem = document.getElementById("recipient");
        this.messageForm = document.getElementById('messageForm');
        this.chatBox = document.getElementById('chat');
        this.user = user;
    }

    showConvoList(conversations){
        conversations.forEach( userChat => {
            let contactWrapper = getUserTab(userChat, participant)
            let chat = { participant, id }
            contactWrapper.addEventListener('click',(chatEvent)(chat))
            usersElem.appendChild(contactWrapper)
        })
    }

    displayChats(messageArray){
        self = this
        this.chatBox.innerHTML = "";
        messageArray.forEach(chat => {
            const { sender } = chat;
            let newmessage = null;
            if (sender == self.user){
                newmessage = newSentMsg(chat);
            } else {
                newmessage = newReceivedMsg(chat);
            }
            self.chatBox.appendChild(newmessage);
        })
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    addMessage(chat){
        const { sender } = chat;
        let newmessage = null;
        if (sender == this.user){
            newmessage = newSentMsg(chat);
        } else {
            newmessage = newReceivedMsg(chat);
        }
        this.chatBox.appendChild(newmessage)
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }


}


// const WorkerIO = new SharedWorker('shared_worker.js', 'NDN-Worker');
let currentChat = null;
let mainUser = null;
let timerId = null;
let lastOffline = null;
let conversationList = [];

WorkerIO.port.addEventListener('message', function(eventM){
    console.log('OnMessage:', eventM.data);
    let { event, data } = eventM.data


});

WorkerIO.port.addEventListener('error', function(e){
    throw new Error('WorkerIO Error: could not open SharedWorker', e);
  }, false);
  
  
  // create classes for create message, create user
  
  let chatEvent = (chat) => {
      return ()=>{
          if (currentChat !== chat){
              console.log(chat)
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