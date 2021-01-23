// fortune.js
// 
// This will retrieve the array from jsoncollections\fortunes.json and post one at random. 

// Imports
const fs = require("fs");
const directory = 'jsoncollections/fortunes.json'


export default function (msg,client) {
    var fortunes = JSON.parse(fs.readFileSync(directory))
    msg.channel.send(fortunes[Math.floor(Math.random()*fortunes.length)].message)
    return;
}