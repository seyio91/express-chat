const fetch = require('node-fetch');

const buildUrl = (url, parameters) => {
    let qs = "";
    for (const key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            const value = parameters[key];
            qs +=
                encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
        }
    }
    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1); //chop off last "&"
        url = url + "?" + qs;
    }

    return url;
}

const getData = async url => {
    const response = await fetch(url)
    const resData = await response.json()
    return resData
}

const getUsers = async url => {
    response = await fetch(url)
    const data = await response.json();
    return {
        data,
        link: response.headers.get('link')
    }
}

const postData = async (url, data) => {
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const resData = await response.json()
    return resData
}

// User Class
class User {
    constructor(first_name, last_name, username, email, password){
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    async save() {
        await postData("http://localhost:3000/users/", this)
        console.log(this)
    }

    static async findOneUser(dict = { email: signupEmail}){
       const userUrl = buildUrl("http://localhost:3000/users/", dict)
       return await getData(userUrl)
    }
}

module.exports = {
    buildUrl,
    getData,
    getUsers,
    postData,
    User
  }