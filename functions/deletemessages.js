// listoldmessages.js
// This function is designed to return all of the message counts for users that are no longer in the server. 

// Imports
var utilityfunctions = require('../internalfunctions/utilityfunctions.js');
var messagefunctions = require('../internalfunctions/messagefunctions.js');

var moment = require('moment');

export default function(msg,client) {
    if (utilityfunctions.checkMod(msg) == false) {
        msg.channel.send(`This function is only available to moderators, <@${msg.author.id}>.`, { allowedMentions: { parse: [] } });
        return
    }
    else {
        var waitmsg = new Object();
        msg.channel.send('Retrieving message history for the server - Please wait!').then((waitingmsg) => {
            waitmsg = waitingmsg;
        })
        var channels = msg.guild.channels.cache.filter(channel => channel.type === 'text');
        var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
        var members = msg.guild.members.cache;
        var promisearray = [];
        var messagearray = new Object();
        messagefunctions.getMessages(channelkeys).then((messageobjects) => {
            messageobjects.forEach((object) => {
                if ((members.get(object.author) == undefined)&&(object.author != undefined)) {
                    if (messagearray[object.author] == undefined) {
                        messagearray[object.author] = [];
                    }
                    messagearray[object.author].push(object);
                }
            })
            var messagearraykeys = Object.keys(messagearray);
            var flatarray = [];
            console.log(messagearraykeys);
            if (messagearraykeys.length > 0) {
                var deletedcount = 0;
                messagearraykeys.forEach((person) => {
                    messagearray[person].forEach((oldmsg) => {
                        flatarray.push(oldmsg);
                    })
                })
                var theinterval = setInterval(() => {
                    waitmsg.edit(`Deleting messages sent by old users - Deleted **${deletedcount}** of **${flatarray.length}**`)
                }, 8000);
                waitmsg.edit(`Deleting messages sent by old users - Deleted **${deletedcount}** of **${flatarray.length}**`).then(() => {
                    
                })
                flatarray.forEach((oldmsg) => {
                    let thechannel = channels.get(oldmsg.channel)
                    try {
                        thechannel.messages.fetch(oldmsg.id).then((fetchedmsg) => {
                            fetchedmsg.delete().then(() => {
                                deletedcount++;
                                if (deletedcount >= flatarray.length) {
                                    clearInterval(theinterval);
                                    waitmsg.edit(`Done with deleting messages - Deleted **${deletedcount}**.`);
                                }
                            })
                        })
                    }
                    catch (err) {
                        deletedcount++;
                        console.log(err)
                    }
                })
            }
            else {
                waitmsg.edit(`There are no former users to remove messages from.\n`).then(() => { });
            }
        })
    }
}