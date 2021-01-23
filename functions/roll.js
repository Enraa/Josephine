// roll.js
//
// Rolls a 6 sided die by default, or however many places are provided. This is a simple libraryless function. 

// Variables
var sideddice = /[0-9]+d[0-9]+/
var number = /[0-9]+/

export default function(msg,client) {
    var dicenum = 1;
    var dicefaces = 6;
    if (msg.content.toLowerCase().search(sideddice) != -1) {
        console.log("sideddie")
        var diematch = msg.content.toLowerCase().match(sideddice);
        console.log(diematch)
        var diceparts = diematch[0].split('d');
        dicenum = diceparts[0];
        dicefaces = diceparts[1];
    }
    else if (msg.content.toLowerCase().search(number) != -1) {
        console.log("number")
        var diematch = msg.content.toLowerCase().match(number);
        console.log(diematch)
        dicefaces = diematch;
    }
    if ((dicenum > 200)||(dicefaces > 50000)) {
        msg.channel.send("Please use smaller numbers. Up to 200 50000-sided dice can be used.");
        return;
    }
    var returnstring = `Rolling ${dicenum} ${dicefaces}-sided ${(dicenum == 1) ? 'die' : 'dice'}.\n`
    var dieresults = []; 
    var i = 0; 
    try {
        while (dicenum > i) {
            dieresults.push(Math.ceil(Math.random()*dicefaces))
            i++;
        }
    }
    catch (err) {
        console.log(err);
    }
    if (dieresults.length == 1) { 
        returnstring = `${returnstring}**${dieresults[0]}**!`
    }
    else {
        var mathstring = '';
        var dietotal = 0;
        dieresults.forEach((die) => {
            mathstring = `${mathstring} + ${die}`
            dietotal = dietotal + die;
        })
        returnstring = `${returnstring}${mathstring.slice(3)} = **${dietotal}**!`
    }
    msg.channel.send(returnstring)
    return;
}