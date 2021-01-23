// listusers.js
//
// Lists all users that match the older than or newer than conditions. 

// Imports
var utilityfunctions = require('../internalfunctions/utilityfunctions.js');
var messagefunctions = require('../internalfunctions/messagefunctions.js');

var moment = require('moment');


export default function(msg,client) {
    try {
        if (utilityfunctions.checkMod(msg) == false) {
            msg.channel.send(`This function is only available to moderators, <@${msg.author.id}>.`, { allowedMentions: { parse: [] } });
            return
        }
        else {
            // Remove the calling function, !roleadd. This will slice all the way up to and including the first " "
            var messageslice = msg.content.slice(/\S+ /.exec(msg.content)[0].length);
            // Determine if we are testing greater than or less than the timeframe old. 
            messageslice = messageslice.toLowerCase();
            var greaterthan = (messageslice.slice(0,1) == ">") ? 'greater' : 'less'
            messageslice = messageslice.slice(2);
    
            // Determine the number we're testing with.
            var numberregex = /\d+/g.exec(messageslice)[0];
            messageslice = messageslice.slice(numberregex.length+1);
    
            // Determine what kind of operator we're working with. 
            var datetest = '';
            var datestringtest = messageslice.slice(0,3);
            var multiplier = 0;
            if (datestringtest.search("y") == 0) { multiplier = 525600; datetest = "year" }
            if (datestringtest.search("m") == 0) { multiplier = 43800; datetest = "month" }
            if (datestringtest.search("w") == 0) { multiplier = 10080; datetest = "week" }
            if (datestringtest.search("d") == 0) { multiplier = 1440; datetest = "day" }
            if (datestringtest.search("h") == 0) { multiplier = 60; datetest = "hour" }
            if (datestringtest.search("mi") == 0) { multiplier = 1; datetest = "minute" }
            if (greaterthan > 1) { datetest = `${datetest}s` }
    
            var waitmsg = new Object();
            msg.channel.send('Retrieving message history for the server - Please wait!').then((waitingmsg) => {
                waitmsg = waitingmsg;
            })
            var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
            messagefunctions.getMessages(channelkeys).then((messageobjects) => {
                var latestmessage = new Object();
                messageobjects.forEach((object) => {
                    if ((latestmessage[object.author] == undefined)||(object.timestamp > latestmessage[object.author].timestamp)) {
                        latestmessage[object.author] = object;
                    }
                })
                var messagearray = [];
                for (var prop in latestmessage) {
                    if (latestmessage.hasOwnProperty(prop)) {
                        messagearray.push(latestmessage[prop])
                    }
                }
                waitmsg.edit(`Listing members that are ${greaterthan} than ${numberregex} ${datetest} old:\n`, { allowedMentions: { parse: [] } }).then(() => {
                    var qualifiedusers = [];
                    var members = msg.guild.members.cache;
                    var messagesend = ``
                    messagearray.forEach((messageobject) => {
                        if (greaterthan == "less") {
                            if (moment().diff(moment(messageobject.timestamp), 'minutes') < (multiplier*parseInt(numberregex))) {
                                qualifiedusers.push(members.get(messageobject.author))
                            }
                        }
                        else {
                            if (moment().diff(moment(messageobject.timestamp), 'minutes') > (multiplier*parseInt(numberregex))) {
                                qualifiedusers.push(members.get(messageobject.author))
                            }
                        }
                    })
                    qualifiedusers.forEach((mem) => {
                        if (mem != undefined) {
                            if ((messagesend.length) >= 1950) {
                                msg.channel.send(messagesend, { allowedMentions: { parse: [] } })
                                messagesend = '';
                            }
                            if (messagesend.length == 0) { 
                                messagesend = `<@${mem.id}>` 
                            }
                            else {
                                messagesend = `${messagesend}, <@${mem.id}>`
                            }
                        }
                    })
                    msg.channel.send(messagesend, { allowedMentions: { parse: [] } })
                })
            })
        }        
    }
    catch (err) {
        msg.channel.send("Something went wrong with that command. Please use this command like this:\n\n**listusers < 2 months**\nUse **<** or **>** any **number**, and **years, months, weeks, days, hours or minutes**.")
    }
}