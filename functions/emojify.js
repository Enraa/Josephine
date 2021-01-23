// emojify.js
//
// Takes an input string from the message, or the message being replied to and attempts to insert emoji. 

// Imports
var nodeemoji = require('node-emoji');

// Variables
var randomchance = 0.15          // This variable dictates the likelihood that non-emoji replacements will just get a random emoji. 

export default async function (msg,client) {
    console.log(msg);
    var inputtext = msg.content.slice(9);
    if (msg.reference != undefined) { // If this is a message being replied to with this command
        var refmsg = await msg.channel.messages.fetch(msg.reference.messageID)
        inputtext = `${refmsg.content}`; 
    }
    console.log(inputtext);
    if (inputtext.length == 0) { // Catch if there is nothing to emojify. 
        msg.channel.send('Please reply to a message with this command or type something to brutally murder with emoji.')
        return;
    }
    inputtext = inputtext.split(" ");
    var outputtext = '';
    var prevword = '';

    // OnMissing handler for emoji. If this text string doesn't have a matching emoji, we'll silently discard
    var onMissing = function (n) {
        return false;
    }

    outputtext = '';

    inputtext.forEach((word) => { // Check for each emoji individually and for interactions with previous word like "raising_hand"
        var emojilist = nodeemoji.search(`${word}`) 
        if (emojilist.length != 0) {
            outputtext = `${outputtext} ${word} ${emojilist[Math.floor(Math.random()*emojilist.length)].emoji}`
        }
        else {
            outputtext = `${outputtext} ${word}`
            if (Math.random() < randomchance) {
                outputtext = `${outputtext} ${nodeemoji.random().emoji}`
            }
        }
        console.log(word)
        console.log(emojilist)
        console.log(" ");
        prevword = word
    })

    msg.channel.send(outputtext.slice(0,1950)); // Reduce the text output to 1950 characters to avoid any message crashes. 
}