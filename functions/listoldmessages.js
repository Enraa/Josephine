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
            console.log(messagearraykeys);
            if (messagearraykeys.length > 0) {
                waitmsg.edit(`Messages sent By Former Users:\n`).then(() => {
                    var messagesend = ``
                    var i = 0;
                    for (i = 0; messagearraykeys.length > i; i++) {
                        try {
                            let newmsgobject = `<@${messagearray[messagearraykeys[i]][0].author}> - ${messagearray[messagearraykeys[i]].length}`
                            newmsgobject = `${newmsgobject}\n`;
                            if (((messagesend.length)+(newmsgobject.length)) >= 1950) {
                                msg.channel.send(messagesend, { allowedMentions: { parse: [] } });
                                messagesend = '';
                            }
                            messagesend = messagesend + newmsgobject;
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    msg.channel.send(messagesend, { allowedMentions: { parse: [] } });
                })
            }
            else {
                waitmsg.edit(`There are no former users to remove messages from.\n`).then(() => { });
            }
        })
    }
}