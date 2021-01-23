// info.js
// 
// Returns an info card for a given user or channel. 

// Imports
var utilityfunctions = require('../internalfunctions/utilityfunctions.js');
var messagefunctions = require('../internalfunctions/messagefunctions.js');
var algorithmfunctions = require('../internalfunctions/algorithmfunctions.js');
var loggingfunctions = require("../internalfunctions/logging.js");

var moment = require('moment');

const timestampsmax = 10;


export default function(msg,client) {
    var tag = '';
    var type = 'server'
    if (msg.mentions.channels.first() != undefined) {
        // A channel was tagged, let's just add it straight to the list. 
        tag = msg.mentions.channels.first().id;
        type = 'channel'
    }
    if (msg.mentions.members.first() != undefined) {
        // A member was tagged, let's just add it straight to the list. 
        tag = msg.mentions.members.first().id;
        type = 'member'
    }
    // This is requesting for a card on the server. 
    if (msg.content.toLowerCase().search('server') != -1) {
        tag = msg.guild.id;
    }
    // Nobody was tagged, so let's get every channel and every member and try to match them
    if ((type != 'channel')&&(type != 'member')&&(msg.content.toLowerCase().search('server') == -1)&&(/\S+ /.exec(msg.content) != null)) {
        // Slice off the operator, we're done with it. 
        var messageslice = msg.content.slice(/\S+ /.exec(msg.content)[0].length).toLowerCase();
        console.log(messageslice);

        var messageslicearray = [messageslice]
        var guildchannellist = msg.guild.channels.cache.map(channel => channel.name);
        messageslicearray.forEach((slice) => {
            let reg = RegExp(slice.toLowerCase());
            var i = 0;
            while (guildchannellist.length > i) {
                if (reg.test(guildchannellist[i].toLowerCase())) { 
                    tag = msg.guild.channels.cache.find(channel => channel.name == guildchannellist[i]).id
                    type = 'channel'
                    i = 9000;
                }
                i++;
            }
        })
        if (type != 'channel') {
            var guildmemberlist = msg.guild.members.cache.map(member => member.displayName.toLowerCase());
            console.log(guildmemberlist);
            messageslicearray.forEach((slice) => {
                let reg = RegExp(slice.toLowerCase());
                var i = 0;
                while (guildmemberlist.length > i) {
                    if (reg.test(guildmemberlist[i].toLowerCase())) { 
                        tag = msg.guild.members.cache.find(member => member.displayName.toLowerCase() == guildmemberlist[i]).id
                        type = 'member'
                        i = 9000;
                    }
                    i++;
                }
            })
        }
    }
    if (tag.length != 0) {
        var channelarray = [];
        if (type == 'channel') {
            channelarray.push(tag)
            messagefunctions.getMessages(channelarray).then((result) => {
                algorithmfunctions.getTimestamps(msg.guild.id,'channel',channelarray[0]).then((timestamps) => {
                    var channel = msg.guild.channels.cache.find(channel => channel.id == tag)
                    var desc = `**Created on:** ${moment(channel.createdTimestamp).format("MMMM DD, YYYY")}\n**Total Messages:** ${result.length}\n**Messages Per Day:** ${utilityfunctions.roundToOne(((result.length-1)/(moment().diff(moment(channel.createdTimestamp),'days'))))}`
                    var sortedresults = new Object();
                    var sortedresultsmapped = [];
                    result.forEach((msg) => {
                        if (!(msg.author == undefined)) {
                            if (sortedresults.hasOwnProperty(msg.author)) {
                                sortedresults[msg.author]++;
                            } else {
                                sortedresults[msg.author] = 1;
                            }
                        }
                    })
                    for (var prop in sortedresults) {
                        if (sortedresults.hasOwnProperty(prop)) {
                            sortedresultsmapped.push({
                                author: prop,
                                count: sortedresults[prop]
                            })
                        }
                    }
                    sortedresultsmapped.sort(function (a, b) {
                        return b.count - a.count;
                    });
                    var i;
                    var topusercount = ``;
                    var maxlengthcount = 10;
                    if (sortedresultsmapped.length < 10) { maxlengthcount = sortedresultsmapped.length }
                    console.log(sortedresultsmapped);
                    for (i = 0; i < maxlengthcount; i++) {
                        let membername = '';
                        try {
                            membername = msg.guild.members.cache.find(member => member.id == sortedresultsmapped[i].author).displayName
                        }
                        catch (err) {
                            i--;
                            // Remove this entry so we'll use the next one down. This should avoid problems with former members.
                            sortedresultsmapped.splice(i,1);
                        }
                        if (membername.length != 0) {
                            topusercount = `${topusercount}\n**${membername}:** ${sortedresultsmapped[i].count}`
                        }
                    }
                    topusercount = ["Top Users",topusercount]
                    var embed = loggingfunctions.createEmbed(`Details for #${channel.name}`,desc,null,msg.guild.iconURL(),null,topusercount);
                    msg.channel.send(embed);
                })
            })
        }
        else if (type == "server") {
            channelarray = msg.guild.channels.cache.map(channel => channel.id);
            messagefunctions.getMessages(channelarray).then((result) => {
                algorithmfunctions.getDictionaries(msg.guild.id,'server',null).then((timestamps) => {
                    var messageblock = [];
                    result.forEach((resarray) => {
                        resarray.forEach((messageobj) => {
                            messageblock.push(messageobj);
                        })
                    })
                    var guild = msg.guild;
                    var desc = `**Created on:** ${moment(guild.createdTimestamp).format("MMMM DD, YYYY")}\n**Total Messages:** ${result.length}\n**Messages Per Day:** ${utilityfunctions.roundToOne(((result.length-1)/(moment().diff(moment(guild.createdTimestamp),'days'))))}`
                    var sortedresults = new Object();
                    var sortedresultsmapped = [];
                    result.forEach((msg) => {
                        if (!(msg.author == undefined)) {
                            if (sortedresults.hasOwnProperty(msg.author)) {
                                sortedresults[msg.author]++;
                            } else {
                                sortedresults[msg.author] = 1;
                            }
                        }
                    })
                    for (var prop in sortedresults) {
                        if (sortedresults.hasOwnProperty(prop)) {
                            sortedresultsmapped.push({
                                author: prop,
                                count: sortedresults[prop]
                            })
                        }
                    }
                    sortedresultsmapped.sort(function (a, b) {
                        return b.count - a.count;
                    });
                    var i;
                    var topusercount = ``;
                    var maxlengthcount = 10;
                    if (sortedresultsmapped.length < 10) { maxlengthcount = sortedresultsmapped.length }
                    console.log(sortedresultsmapped);
                    for (i = 0; i < maxlengthcount; i++) {
                        let membername = '';
                        try {
                            membername = msg.guild.members.cache.find(member => member.id == sortedresultsmapped[i].author).displayName
                        }
                        catch (err) {
                            i--;
                            // Remove this entry so we'll use the next one down. This should avoid problems with former members.
                            sortedresultsmapped.splice(i,1);
                        }
                        if (membername.length != 0) {
                            topusercount = `${topusercount}\n**${membername}:** ${sortedresultsmapped[i].count}`
                        }
                    }
                    topusercount = ["Top Users",topusercount]
                    var embed = loggingfunctions.createEmbed(`Details for #${guild.name}`,desc,null,msg.guild.iconURL(),null,topusercount);
                    msg.channel.send(embed);
                })
            })
        }
        else if (type == "member") {
            channelarray = msg.guild.channels.cache.map(channel => channel.id);
            messagefunctions.getMessagesUser(tag,channelarray).then((result) => {
                var messageblock = [];
                var messagefrombiggestchannel = '';
                var biggestlength = 0;
                result.forEach((resarray) => {
                    if (resarray.length > biggestlength) {
                        biggestlength = resarray.length;
                        messagefrombiggestchannel = resarray[resarray.length-1];
                    }
                    resarray.forEach((messageobj) => {
                        messageblock.push(messageobj);
                    })
                })
                algorithmfunctions.getDictionaries(msg.guild.id,'member',tag).then((timestamps) => {
                    utilityfunctions.sortDictionaryDesc(timestamps).then((sortedtimestamps) => {
                        var timestampembeds = [];
                        var i = 0;
                        while (timestampsmax > i) {
                            if (sortedtimestamps[i].name.length == 0) {
                                console.log(sortedtimestamps[i])
                                sortedtimestamps.splice(i,1);
                            }
                            else {
                                timestampembeds.push(`**${sortedtimestamps[i].name}:** ${sortedtimestamps[i].total}`)
                                i++;
                            }
                        }
                        var member = msg.guild.members.cache.find(member => member.id == tag)
                        var desc = `**Joined on:** ${moment(member.joinedTimestamp).format("MMMM DD, YYYY")}\n**Total Messages:** ${messageblock.length}\n**Messages Per Day:** ${utilityfunctions.roundToOne(((messageblock.length-1)/(moment().diff(moment(member.joinedTimestamp),'days'))))}\n**Favorite Channel:** <#${messagefrombiggestchannel.channel}>`
                        var sortedresults = new Object();
                        var sortedresultsmapped = [];
                        var embedarray = ["Favorite Words",timestampembeds]
                        var embed = loggingfunctions.createEmbed(`Details for ${member.displayName}`,desc,null,member.user.displayAvatarURL(),null,embedarray);
                        msg.channel.send(embed);
                    });
                })
            })
        }
    }
    else {
        channelarray = msg.guild.channels.cache.map(channel => channel.id);
        messagefunctions.getMessagesUser(msg.member.id,channelarray).then((result) => {
            var messageblock = [];
            var messagefrombiggestchannel = '';
            var biggestlength = 0;
            result.forEach((resarray) => {
                if (resarray.length > biggestlength) {
                    biggestlength = resarray.length;
                    messagefrombiggestchannel = resarray[resarray.length-1];
                }
                resarray.forEach((messageobj) => {
                    messageblock.push(messageobj);
                })
            })
            algorithmfunctions.getDictionaries(msg.guild.id,'member',msg.member.id).then((timestamps) => {
                utilityfunctions.sortDictionaryDesc(timestamps).then((sortedtimestamps) => {
                    var timestampembeds = [];
                    var i = 0;
                    while (timestampsmax > i) {
                        if (sortedtimestamps[i].name.length == 0) {
                            console.log(sortedtimestamps[i])
                            sortedtimestamps.splice(i,1);
                        }
                        else {
                            timestampembeds.push(`**${sortedtimestamps[i].name}:** ${sortedtimestamps[i].total}`)
                            i++;
                        }
                    }
                    var member = msg.member;
                    var desc = `**Joined on:** ${moment(member.joinedTimestamp).format("MMMM DD, YYYY")}\n**Total Messages:** ${result.length-1}\n**Messages Per Day:** ${utilityfunctions.roundToOne(((messageblock.length-1)/(moment().diff(moment(member.joinedTimestamp),'days'))))}\n**Favorite Channel:** <#${messagefrombiggestchannel.channel}>`
                    var sortedresults = new Object();
                    var sortedresultsmapped = [];
                    var embedarray = ["Favorite Words",timestampembeds]
                    var embed = loggingfunctions.createEmbed(`Details for ${member.displayName}`,desc,null,member.user.displayAvatarURL(),null,embedarray);
                    msg.channel.send(embed);
                })
            })
        })
    }
}