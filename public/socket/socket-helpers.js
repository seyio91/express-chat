// #################################### DOM FUNCTIONS ############################################

// Highlight New Conversation
// When new Conversation is clicked
// removes highlight from old conversation

export const removePrevConvo = (userChat) => {
    let oldUser = document.getElementById(userChat.participant)
    let oldUserclass = oldUser.getAttribute('class');
    oldUserclass = oldUserclass.replace(' bg-light', "")
    oldUser.setAttribute('class', oldUserclass);
}


// Highlights the New Conversation
export const loadConversation = (userChat) => {
    let newUser = document.getElementById(userChat.participant);
    let newUserclass = newUser.getAttribute('class');
    newUser.setAttribute('class', `${newUserclass} bg-light`);
}


// Creates a Received Message
export const newReceivedMsg = (messages) => {
    const { message, timestamp } = messages;
    let { day, time } = timeDisplayHandler(timestamp)
    let newmessage = document.createElement('div');
    newmessage.innerHTML = `
        <div class="media-body ml-3">
            <div class="conversation">
                <div class="senderChat"></div>
                <div class="bg-white rounded py-2 px-3 chatwrapper">
                    <p class="text-small mb-0 text-muted">${message}</p>
                </div>
            </div>
            <p class="small text-muted mb-2">${day} ${time}</p>
        </div>
        `
    newmessage.setAttribute('class', 'media w-50')
    return newmessage;
}


// Creates a Sent Message Message
export const newSentMsg = (messages) => {
    const { message, timestamp } = messages;
    let { day, time } = timeDisplayHandler(timestamp)
    let newmessage = document.createElement('div');
    newmessage.innerHTML = `
        <div class="media-body">
            <div class="conversation">
                <div class="bg-primary rounded py-2 px-3 chatwrapper">
                    <p class="text-small mb-0 text-white">${message}</p>
                </div>
                <div class="receiverChat"></div>
            </div>
            <p class="small text-muted mb-2" style="float: right;">${day} ${time}</p>
        </div>
        `
    newmessage.setAttribute('class', 'media w-50 ml-auto')
    return newmessage;
}

// Create User Conversations
export const getUserTab = (messages, user, status) => {
    let { displayMessage, displayTime } = convoHelper(messages, user)
    let contactWrapper = document.createElement('a');
    let onlineStatus = status ? 'online-user' : 'offline-user'
    contactWrapper.innerHTML = `
            <div class="media">
                <div class="userbox">
                    <img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                    <!-- <span class="p-status ${onlineStatus}"></span> -->
                </div>
        
                <div class="media-body ml-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">${user}</h6><small class="small font-weight-bold">${displayTime}</small>
                    </div>
                <p class="font-italic text-muted mb-0 text-small">${displayMessage}</p>
                </div>
        </div>
    `
    contactWrapper.setAttribute('class', 'list-group-item list-group-item-action list-group-item-light rounded-0')
    contactWrapper.setAttribute('id', `${user}`);
    return contactWrapper;
    }

export const newUserTab = (userObj) => {
    let contactWrapper = document.createElement('a');
    contactWrapper.innerHTML = `
            <div class="media">
                <div class="userbox">
                    <img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                </div>
        
                <div class="media-body ml-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">${userObj.email}</h6>
                    </div>
                </div>
        </div>
    `
    contactWrapper.setAttribute('class', 'list-group-item list-group-item-action list-group-item-light rounded-0')
    contactWrapper.setAttribute('id', `${userObj.email}`);
    return contactWrapper;
}




// Toggle User Online/ Offline
export const toggleUserStatus = (user, status) => {
    // console.log(document.getElementById(user))
    let userElem = document.getElementById(user).querySelectorAll('span')[0];
    if (userElem) {
        let currClass = userElem.getAttribute('class');
        if (status){
            currClass = currClass.includes('offline-user') ? currClass.replace('offline-user', 'online-user') : currClass
        } else {
            currClass = currClass.includes('online-user') ? currClass.replace('online-user', 'offline-user'): currClass
        }
        userElem.setAttribute('class', currClass)

    }
}

// Toggle if Device is offline or online
export const toggleConnStatus = (status) => {
    let connector = document.getElementById('online-status').querySelector('span')
    let userStatus = document.getElementById('online-status').querySelector('p')

    let conClass = connector.getAttribute('class');
    if (status){
        conClass = conClass.includes('offline-user') ? conClass.replace('offline-user', 'online-user') : conClass
        userStatus.innerText = "Online"
    } else {
        conClass = conClass.includes('online-user') ? conClass.replace('online-user', 'offline-user') : conClass
        userStatus.innerText = "Offline"
    }
    connector.setAttribute('class', conClass);
}


// ################################### HELPERS ##################################################

const timeDiff = (timestamp, difftype) => {
    let msgTime = moment(timestamp);
    let currentMoment = moment()
    let dayfrom = currentMoment.diff(msgTime, difftype)
    return dayfrom
}

// Time Display Helper
const timeDisplayHandler = (timestamp) => {
    let msgTime = moment(timestamp);
    let time = msgTime.format('hh:mm A')
    let dayfrom = timeDiff(timestamp, 'days')
    let day = ""

    switch (true) {
        case dayfrom == 0:
          day = "";
          break;
        case dayfrom == 1:
          day = "Yesterday";
          break;
        case dayfrom <= 7:
           day = msgTime.format('ddd');
          break;
        case dayfrom > 7 :
          day = msgTime.format('MMM DD');
          break;
        default:
            break;
      }

      time = day == "" ? time : `| ${time}`
      return { day, time };
}

// Helper Conversation Details
const convoHelper = (messages, user) => {
    let displayMessage= '';
    let {message, sender, timestamp, read } = messages
    let { day, time } = timeDisplayHandler(timestamp)
    let displayTime = day == "" ? time : day;
    if (sender != user) {
        displayMessage =  `you: ${message}`;
    } else {
        if (read){
            displayMessage = message;
        } else {
            displayMessage = `<b>${message}</b>`
        }
    }
    return { displayMessage, displayTime }
}



export const conversationMerge = (target, source) => {
    source.forEach(sourceElem => {
		let index = target.findIndex(convo => convo.id == sourceElem.id)
		if (index != -1){
            let targetElem = target[index]
            target.splice(index, 1);
            sourceElem = { ...targetElem, ...sourceElem}
        }
		target.unshift(sourceElem);
    })
    return target;
}


export const singleConvo = (cid, participant, msg, read, sender, timestamp) => {
    return {
        id: cid,
        participant,
        newchat: false,
        status: true,
        lastMessage: {
            message: msg,
            read,
            sender,
            timestamp
        }
    }
}

export const onlineStatus = (timestamp) => {
	if (!timestamp) return '';
	let timeInfo = timeDisplayHandler(timestamp)
	let {day, time} = timeInfo
	let dayfrom = timeDiff(timestamp, 'minutes')
	if (dayfrom > 3){
		return `lastSeen: ${day} ${time}`
	} else {
        return `Status: Online` 
    }
}


export const debounce = (func, wait) => {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };