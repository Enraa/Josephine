// graph.js
//
// This function will handle the user input to graph channels. 

// Imports
const algorithmfunctions = require("../internalfunctions/algorithmfunctions.js");
const drawingfunctions = require("../internalfunctions/drawingfunctions.js");

// Function
export default function (msg,client) {
    // Determine the type of graph. At the time of writing, this function only supports two types. 
    var type = "time";
    var mentiontype = "member";
    var rateregex = RegExp(/((hour)|(rate))/i);
    var ratematch = msg.content.toLowerCase().match(rateregex);
    if (ratematch != null) { 
        type = "rate" 
    }
    else {
        ratematch = [null];
    }

    // This should give us a name, if mentions don't resolve
    var workingmsg = msg.content.toLowerCase().slice(7).replace(ratematch[0],'').replace(" ",''); 
    // Determine the target of the graph function. 
    var target = msg.member;
    // Check channel mentions. These will only be checked by mention rather than name resolved, 
    // as the person doing the query should be able to see it. 
    if (msg.mentions.channels.first() != null) {
        target = msg.mentions.channels.first();
        mentiontype = "channel";
    }
    // Now we'll check by name. First we'll attempt to resolve by member mention. 
    else if (msg.mentions.members.first() != null) {
        target = msg.mentions.members.first();
    }
    // Now we'll try to match the name to someone in the server. 
    else if (workingmsg.length > 0) {
        var messageslicearray = [workingmsg]
        var usercollection = msg.guild.members.cache.map(member => member.name);
        messageslicearray.forEach((slice) => {
            let reg = RegExp(slice);
            var i = 0;
            while (usercollection.length > i) {
                try {
                    if (reg.test(usercollection[i].toLowerCase())) { 
                        target = usercollection[i];
                        i = 9000;
                    }
                }
                catch(err) { }
                i++;
            }
        })
    }
    // Check if we are working with a user - if we are, this person needs admin permissions. 
    if ((!(target.id == msg.member.id))&&(mentiontype == "member")&&(!(msg.member.hasPermission('MANAGE_MESSAGES')))) {
        msg.channel.send("You do not have permission to view statistics for other people.");
        return;
    }
    if (type == "rate") {
        if (mentiontype == "member") {
            try {
                algorithmfunctions.getTimestamps(msg.guild.id,"member",target.id).then((arrayblob) => {
                    algorithmfunctions.hourMap24(arrayblob).then((array) => {
                        drawingfunctions.createActivityGraphHourly(array,target.displayName).then((buffer) => {
                            msg.channel.send({
                                files: [{
                                    attachment: buffer,
                                    name: `${target.displayName} - ${type}.jpg`
                                }]
                            })
                        })
                    })
                })
            }   
            catch (err) {
                console.log(err); 
            } 
        }
        else {
            try {
                algorithmfunctions.getTimestamps(msg.guild.id,"channel",target.id).then((arrayblob) => {
                    algorithmfunctions.hourMap24(arrayblob).then((array) => {
                        drawingfunctions.createActivityGraphHourly(array,target.name).then((buffer) => {
                            msg.channel.send({
                                files: [{
                                    attachment: buffer,
                                    name: `${target.displayName} - ${type}.jpg`
                                }]
                            })
                        })
                    })
                })
            }   
            catch (err) {
                console.log(err); 
            } 
        }
    }
    else {
        if (mentiontype == "member") {
            try {
                algorithmfunctions.getTimestamps(msg.guild.id,"member",target.id).then((arrayblob) => {
                    drawingfunctions.createActivityGraph(arrayblob,target.displayName).then((buffer) => {
                        msg.channel.send({
                            files: [{
                                attachment: buffer,
                                name: `${target.displayName} - ${type}.jpg`
                            }]
                        })
                    })
                })
            }   
            catch (err) {
                console.log(err); 
            } 
        }
        else {
            try {
                algorithmfunctions.getTimestamps(msg.guild.id,"channel",target.id).then((arrayblob) => {
                    drawingfunctions.createActivityGraph(arrayblob,target.name).then((buffer) => {
                        msg.channel.send({
                            files: [{
                                attachment: buffer,
                                name: `${target.displayName} - ${type}.jpg`
                            }]
                        })
                    })
                })
            }   
            catch (err) {
                console.log(err); 
            } 
        }
    }
}