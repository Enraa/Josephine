// count.js
//
// This function will take the input and count it in each channel, for each user, and across the server. 

// Imports
var algorithmfunctions = require('../internalfunctions/algorithmfunctions.js');

export default function(msg,client) {
    var stringcheck = msg.content.slice(7).toLowerCase();
    if (0 >= stringcheck.length) { msg.channel.send(`Please give me something to count up!`); return }
    var returnmsgtext = `Count of **${stringcheck}**:\n\nUsers:`
    var channels = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
    var members = msg.guild.members.cache.map(member => member.id);
    var promisesarray = [];
    var channelarray = [];
    var memberarray = [];
    var servertotal = 0;
    // Get the Server total.
    promisesarray.push(new Promise ((resolve,reject) => {
        algorithmfunctions.getDictionaries(msg.guild.id,'server',null).then((dictionaries) => {
            console.log("Obtained dict for Server")
            try {
                var i = 0;
                while (dictionaries.length > i) {
                    if (dictionaries[i].name.toLowerCase().includes(stringcheck) == true) {
                        servertotal = dictionaries[i].total;
                        i = 900000;
                    }
                    i++;
                }
                resolve("Done")
            }
            catch (err) {
                console.log(err);
                resolve("Failed")
            }
        });
    }))
    // Get totals for each channel.
    channels.forEach((channel) => {
        promisesarray.push(new Promise ((resolve,reject) => {
            algorithmfunctions.getDictionaries(msg.guild.id,'channel',channel).then((dictionaries) => {
                console.log("Obtained dict for "+channel+" dict length is "+dictionaries.length);
                try {
                    var i = 0;
                    while (dictionaries.length > i) {
                        if (dictionaries[i].name.toLowerCase().includes(stringcheck) == true) {
                            channelarray.push({
                                name: dictionaries[i].name,
                                total: dictionaries[i].total,
                                id: channel
                            });
                            i = 900000;
                        }
                        i++;
                    }
                    console.log("Done for "+channel);
                    resolve("Done")
                }
                catch (err) {
                    console.log(err);
                    resolve("Failed")
                }
            });
        }))
    })
    // Get totals for each member.
    members.forEach((member) => {
        promisesarray.push(new Promise ((resolve,reject) => {
            algorithmfunctions.getDictionaries(msg.guild.id,'member',member).then((dictionaries) => {
                console.log("Obtained dict for "+member+" dict length is "+dictionaries.length);
                try {
                    var i = 0;
                    while (dictionaries.length > i) {
                        if (dictionaries[i].name.toLowerCase().includes(stringcheck) == true) {
                            memberarray.push({
                                name: dictionaries[i].name,
                                total: dictionaries[i].total,
                                id: member
                            });
                            i = 900000;
                        }
                        i++;
                    }
                    console.log("Done for "+member);
                    resolve("Done")
                }
                catch (err) {
                    console.log(err);
                    resolve("Failed")
                }
            });
        }))
    })
    // Wait for all of the checks to finish - 
    console.log(promisesarray)
    console.log(promisesarray.length);
    console.log(channels.length);
    console.log(members.length);
    Promise.all(promisesarray).then((results) => {
        console.log("I got here");
        if (channelarray.length > 1) {
            channelarray = channelarray.sort((a,b) => {
                return b.total - a.total
            })
        }
        if (memberarray.length > 1) {
            memberarray = memberarray.sort((a,b) => {
                return b.total - a.total
            })
        }
        memberarray.forEach((obj) => {
            if (returnmsgtext.length > 1900) {
                msg.channel.send(returnmsgtext, { allowedMentions: { parse: [] } })
                returnmsgtext = '';
            }
            returnmsgtext = `${returnmsgtext}\n<@${obj.id}>: ${obj.total}`
        })
        returnmsgtext = `${returnmsgtext}\n\nChannels:`
        channelarray.forEach((obj) => {
            if (returnmsgtext.length > 1900) {
                msg.channel.send(returnmsgtext, { allowedMentions: { parse: [] } })
                returnmsgtext = '';
            }
            returnmsgtext = `${returnmsgtext}\n<#${obj.id}>: ${obj.total}`
        })
        returnmsgtext = `${returnmsgtext}\n\nServer Total: ${servertotal}`
        msg.channel.send(returnmsgtext, { allowedMentions: { parse: [] } })
    })
}