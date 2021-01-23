// Math.js
//
// Does math stuff. Simple input, simple output. 

// Imports
const Mathlib = require('mathjs');

export default function(msg,client) {
    var msgslice = msg.content.toLowerCase().slice(6);
    if (msgslice.length > 0) {
        var outstring = "Error (This is an invalid input!)"
        try {
            outstring = Mathlib.evaluate(msgslice);
        }
        catch (err) { console.log(err) }
        msg.channel.send(`${msgslice} = ${outstring}`)
    }
    else {
        msg.channel.send(`Please add your equation to evaluate - e.g **${msg.content} 2 * (4 + 3)**`)
    }
} 