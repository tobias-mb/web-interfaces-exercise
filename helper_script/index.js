const axios = require('axios');
const readline = require('readline');
const server = require('./server.json');
const products = require('./products.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//enter username + password
var inputPassword = "";
var inputUsername = "";
new Promise((resolve, reject) => {
    rl.question('Please enter your username:', (answer) => {
        resolve(answer);
    });
})
.then( response => {
    inputUsername = response;
    return new Promise((resolve, reject) => {
        rl.question('Please enter your password:', (answer) => {
            resolve(answer);
            rl.close();
        });
    })
})
.then((response) => {
    inputPassword = response;
    //do axios request for every product
    return Promise.all(products.products.map(p => {
        console.log("send request for " + p.title)
        axios({
            method: "post",
            url: server.address + "/products",
            auth: {
                username: inputUsername,
                password: inputPassword
            },
            data: p
        })
    }))
})
.then((response) => {
    console.log('finished!');
})
.catch(error => {
    console.error(error);
})