// roleremove.js
//
// This will reuse a lot of the same code as with rolehas, but applies a 
// further filter based on the user's last message. 
//
// This will remove a role from users that match the age condition. 

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
        // Remove the calling function, !roleadd. This will slice all the way up to and including the first " "
        var messageslice = msg.content.slice(/\S+ /.exec(msg.content)[0].length);
        var roles = [];
        if (msg.mentions.roles.first() != undefined) {
            // A role was tagged, let's just add it straight to the list. 
            msg.mentions.roles.each((role) => {
                roles.push(role)
            })
        }
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
        if (datestringtest.search("y") == 0) { multiplier = 525600 }
        if (datestringtest.search("m") == 0) { multiplier = 43800 }
        if (datestringtest.search("w") == 0) { multiplier = 10080 }
        if (datestringtest.search("d") == 0) { multiplier = 1440 }
        if (datestringtest.search("h") == 0) { multiplier = 60 }
        if (datestringtest.search("mi") == 0) { multiplier = 1 }

        // Slice off the operator, we're done with it. 
        messageslice = messageslice.slice(/\S+ /.exec(messageslice)[0].length);

        var messageslicearray = [messageslice]
        var guildrolelist = msg.guild.roles.cache.map(role => role.name);
        messageslicearray.forEach((slice) => {
            let reg = RegExp(slice.toLowerCase());
            var i = 0;
            while (guildrolelist.length > i) {
                if (reg.test(guildrolelist[i].toLowerCase())) { 
                    roles.push(msg.guild.roles.cache.find(role => role.name == guildrolelist[i]))
                    i = 9000;
                }
                i++;
            }
        })

        // If we have at least one role to test each of our users against, let's evaluate it. 
        if (roles.length == 0) {
            msg.channel.send("Please include a role's name or tag it.");
            return;
        }
        else {
            var waitmsg = new Object();
            msg.channel.send('Retrieving message history for the server - Please wait!').then((waitingmsg) => {
                waitmsg = waitingmsg;
            })
            var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
            var members = msg.guild.members.cache;
            var promisearray = [];
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
                waitmsg.edit(`Removing ${roles[0]} from the following users:\n`, { allowedMentions: { parse: [] } }).then(() => {
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
                            mem.roles.remove(roles[0]);
                        }
                    })
                    msg.channel.send(messagesend, { allowedMentions: { parse: [] } })
                })
            })
        }
    }
}