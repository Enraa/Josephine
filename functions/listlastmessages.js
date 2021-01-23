// listlastmessages.js
// This function is designed to return all of the last message times for users in the server. 
// It's useful to know general activity for a given user. 

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
        var countvar = false;
        var counttotal = new Object();
        if (msg.content.toLowerCase().includes('count') == true) {
            countvar = true;
        }
        var waitmsg = new Object();
        msg.channel.send('Retrieving message history for the server - Please wait!').then((waitingmsg) => {
            waitmsg = waitingmsg;
        })
        var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
        var members = msg.guild.members.cache;
        var promisearray = [];
        messagefunctions.getMessages(channelkeys).then((messageobjects) => {
            // check if we are listing last messages in each channel or not.
            if (msg.content.slice(1,22).toLowerCase() == "listlastmessages chan") {
                var messageobjects = messageobjects.filter(object => object.author != undefined);
                var latestmessage = new Object();
                messageobjects.forEach((object) => {
                    if ((latestmessage[object.channel] == undefined)||(object.timestamp > latestmessage[object.channel].timestamp)) {
                        latestmessage[object.channel] = object;
                    }
                    counttotal[object.channel] = ++counttotal[object.channel] || 1;
                })
                var messagearray = [];
                for (var prop in latestmessage) {
                    if (latestmessage.hasOwnProperty(prop)) {
                        messagearray.push(latestmessage[prop])
                    }
                }
                utilityfunctions.sortMessageObjectsAsc(messagearray).then((sortedarray) => {
                    console.log(sortedarray);
                    waitmsg.edit(`Last Messages Sent in each channel:\n`).then(() => {
                        var messagesend = ``
                        var missingsend = ``
                        var dateformated = false;
                        var messageblobs = [];
                        var missingblobs = [];
                        sortedarray.forEach((msgobject) => {
                            if (!(msgobject.author == undefined)) {
                                var missing = true;
                                if (members.get(msgobject.author) != undefined) {
                                    missing = false;
                                }
                                try {
                                    let newmsgobject = `<@${msgobject.author}> sent in <#${msgobject.channel}> - **${moment(msgobject.timestamp).fromNow()}**${countvar ? (" - *Count: "+counttotal[msgobject.channel]+"*") : ''}`
                                    if (moment().diff(moment(msgobject.timestamp),'days') > 10) {
                                        newmsgobject = `${newmsgobject} - __(${moment(msgobject.timestamp).format('MM/DD/YYYY')})__`
                                    }
                                    newmsgobject = `${newmsgobject}\n`;
                                    if (missing == false) {
                                        if (((messagesend.length)+(newmsgobject.length)) >= 1950) {
                                            messageblobs.push(messagesend)
                                            messagesend = '';
                                        }
                                        messagesend = messagesend + newmsgobject;
                                    }
                                    else {
                                        if (((missingsend.length)+(newmsgobject.length)) >= 1950) {
                                            missingblobs.push(missingsend)
                                            missingsend = '';
                                        }
                                        missingsend = missingsend + newmsgobject;
                                    }
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }
                        })
                        messageblobs.push(messagesend);
                        if (missingsend.length > 0) {
                            missingblobs.push(missingsend)
                        }
                        if (missingblobs.length > 0) {
                            messageblobs.push("Former members: ")
                            messageblobs = messageblobs.concat(missingblobs)
                        }
                        var messageblobfirst = messageblobs.shift()
                        messageblobs.reduce((previous,item) => {
                            return previous.then((prevval) => {
                                postMessage(msg,item)
                            })
                        }, postMessage(msg,messageblobfirst))
                        if (dateformated) { msg.channel.send(`Dates are formatted as MM/DD/YYYY.`, { allowedMentions: { parse: [] } }); }
                    })
                })
            }
            else {
                var messageobjects = messageobjects.filter(object => object.author != undefined);
                var latestmessage = new Object();
                messageobjects.forEach((object) => {
                    if ((latestmessage[object.author] == undefined)||(object.timestamp > latestmessage[object.author].timestamp)) {
                        latestmessage[object.author] = object;
                    }
                    counttotal[object.author] = ++counttotal[object.author] || 1;
                })
                var messagearray = [];
                for (var prop in latestmessage) {
                    if (latestmessage.hasOwnProperty(prop)) {
                        messagearray.push(latestmessage[prop])
                    }
                }
                utilityfunctions.sortMessageObjectsAsc(messagearray).then((sortedarray) => {
                    console.log(sortedarray);
                    waitmsg.edit(`Last Messages Sent By Each User:\n`).then(() => {
                        var messagesend = ``
                        var missingsend = ``
                        var dateformated = false;
                        var messageblobs = [];
                        var missingblobs = [];
                        sortedarray.forEach((msgobject) => {
                            if (!(msgobject.author == undefined)) {
                                var missing = true;
                                if (members.get(msgobject.author) != undefined) {
                                    missing = false;
                                }
                                try {
                                    let newmsgobject = `<@${msgobject.author}> sent in <#${msgobject.channel}> - **${moment(msgobject.timestamp).fromNow()}**${countvar ? (" - *Count: "+counttotal[msgobject.author]+"*") : ''}`
                                    if (moment().diff(moment(msgobject.timestamp),'days') > 10) {
                                        newmsgobject = `${newmsgobject} - __(${moment(msgobject.timestamp).format('MM/DD/YYYY')})__`
                                    }
                                    newmsgobject = `${newmsgobject}\n`;
                                    if (missing == false) {
                                        if (((messagesend.length)+(newmsgobject.length)) >= 1950) {
                                            messageblobs.push(messagesend)
                                            messagesend = '';
                                        }
                                        messagesend = messagesend + newmsgobject;
                                    }
                                    else {
                                        if (((missingsend.length)+(newmsgobject.length)) >= 1950) {
                                            missingblobs.push(missingsend)
                                            missingsend = '';
                                        }
                                        missingsend = missingsend + newmsgobject;
                                    }
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }
                        })
                        messageblobs.push(messagesend);
                        if (missingsend.length > 0) {
                            missingblobs.push(missingsend)
                        }
                        if (missingblobs.length > 0) {
                            messageblobs.push("Former members: ")
                            messageblobs = messageblobs.concat(missingblobs)
                        }
                        var messageblobfirst = messageblobs.shift()
                        messageblobs.reduce((previous,item) => {
                            return previous.then((prevval) => {
                                postMessage(msg,item)
                            })
                        }, postMessage(msg,messageblobfirst))
                        if (dateformated) { msg.channel.send(`Dates are formatted as MM/DD/YYYY.`, { allowedMentions: { parse: [] } }); }
                    })
                })
            }
        })
    }
}

function postMessage(msg,arraypart) {
    return new Promise((resolve,reject) => {
        msg.channel.send(arraypart, { allowedMentions: { parse: [] } }).then((res) => {
            resolve("Done");
        })
    })
}