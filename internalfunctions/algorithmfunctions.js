// algorithmfunctions.js
// This is a module to handle generating dictionary arrays on a per user, per channel, per server basis
// This will also handle any analysis of messages per day.

// Imports
var moment = require('moment');
var momenttransform = require('moment-transform');
var fs = require('fs');

// Variables


// Self functions
// Create a map for all of the words given in an array
function createWordMap(wordsArray) {
    // create map for word counts
    return new Promise((resolve,reject) => {
        var wordsMap = {};
        wordsArray.forEach(function (key) {
            if (wordsMap.hasOwnProperty(key)) {
                wordsMap[key]++;
            } else {
                wordsMap[key] = 1;
            }
        });
        resolve(wordsMap);
    });
}

// Sort array into descending order. 
function sortByCount(wordsMap) {
    return new Promise((resolve,reject) => {
        var finalWordsArray = [];
        finalWordsArray = Object.keys(wordsMap).map(function (key) {
            return {
                name: key,
                total: wordsMap[key]
            };
        });
        finalWordsArray.sort(function (a, b) {
            return b.total - a.total;
        });
        resolve(finalWordsArray);
    })
}

// Create word array separated by " "
function separateWords(messagearray) {
    return new Promise((resolve,reject) => {
        var wordlist = [];
        messagearray.forEach((element) => {
            if (element.messagetext == undefined) { return }
            var textarray = element.messagetext.toLowerCase().split(" ");
            textarray.forEach(function (word) {
                wordlist.push(word);
            });
        });
        resolve(wordlist);
    })
}

// Same as function above, but handles Discord Message objects instead.
function separateWordsMessages(messagearray) {
    return new Promise((resolve,reject) => {
        var wordlist = [];
        messagearray.forEach((element) => {
            if (element.content == undefined) { return }
            var workingelement = element.content.replace("\n", " ");
            var textarray = workingelement.toLowerCase().split(" ");
            textarray.forEach(function (word) {
                wordlist.push(word);
            });
        });
        resolve(wordlist);
    })
}

// Sort messages given by timestamps in ascending order.
// This is for timestampArray
function sortMessagesAsc(messages) {
    return new Promise((resolve,reject) => {
        var messagesarray = messages
        messagesarray.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        resolve(messagesarray);
    })
}

// Create an array of messages sorted by hours.
// [0] will be the first hour after the member joined. 
function timestampArray(messages,startingtimestamp) {
    return new Promise((resolve,reject) => {
        var messagesslice = messages;
        var timestamparray = [];
        var workingmoment = moment(parseInt(startingtimestamp)).startOf('hour');
        var now = moment();
        var i = 1;
        timestamparray[0] = workingmoment.valueOf();
        workingmoment.add(3600000, "milliseconds");
        // Run until we get to current times. 
        while (workingmoment.isBefore(now)) {
            let timestamp = workingmoment.valueOf();
            var count = 0;
            var after = false;
            while (after != true) {
                if (messagesslice[0] == undefined) {
                    after = true;
                }
                else if (messagesslice[0].timestamp < timestamp) {
                    timestamparray[i] = timestamparray[i] + 1 || 1;
                    messagesslice.splice(0,1);
                }
                else {
                    after = true;
                    if (timestamparray[i] == undefined) {
                        timestamparray[i] = 0;
                    }
                }
            }
            i++;
            workingmoment.add(3600000, "milliseconds");
        }
        resolve(timestamparray);
    })
}

// Access the databaseindex file and remove this amount.
// wordarray is the blob of words, index is the server id, type is server, channel or member, 
// id is the channel or member id, if applicable
function databaseArrayRemoveWords(wordarray,index,type,id = null) {
    return new Promise((resolve,reject) => {
        console.log("databaseArrayRemoveWords ",index,type,id)
        if (type == "server") {
            fs.readFile(`databaseindexes/${index}/serverdictionary.json`, (err,data) => {
                if (err) { console.log(err) }
                else { 
                    let manipulate = JSON.parse(data);
                    for (var prop in wordarray) {
                        console.log(prop);
                        try {
                            var i = manipulate.findIndex(element => element.name == prop)
                            if (i != -1) {
                                manipulate[i].total = (manipulate[i].total - wordarray[prop]);
                                if (manipulate[i].total < 1) {
                                    manipulate.splice(i,1);
                                }
                            }
                        }
                        catch (err) {
                            console.log(prop+" - Error below:");
                            console.log(err);
                        }
                    }
                    fs.writeFileSync(`databaseindexes/${index}/serverdictionary.json`, JSON.stringify(manipulate), (err) => {
                        if (err) { console.log(err) }
                        resolve("Finished");
                    })
                }
            })
        }
        else {
            var typestring = "memberdictionary"
            if (type == "channel") {
                typestring = "channeldictionary"
            }
            fs.readFile(`databaseindexes/${index}/${typestring}.json`, (err,data) => {
                if (err) { console.log(err) }
                else { 
                    if (JSON.parse(data)[id] == undefined) { return }
                    let manipulate = JSON.parse(data);
                    let manipulatepart = data[id];
                    for (var prop in wordarray) {
                        try {
                            var i = manipulate.findIndex(element => element.name == prop);
                            if (i != -1) {
                                manipulatepart[i].total = (manipulatepart[i].total - wordarray[prop]);
                                if (manipulatepart[i].total < 1) {
                                    manipulatepart.splice(i,1);
                                }
                            }
                        }
                        catch (err) {
                            console.log(err);
                        }
                        manipulate[id] = manipulatepart;
                        fs.writeFileSync(`databaseindexes/${index}/${typestring}.json`, JSON.stringify(manipulate), (err) => {
                            if (err) { console.log(err) }
                            resolve("Finished");
                        })
                    }
                }
            })
        }
    })
}

// Access the databaseindex file and add this amount. Same function as above, but inverse. 
// wordarray is the blob of words, index is the server id, type is server, channel or member, 
// id is the channel or member id, if applicable
function databaseArrayAddWords(wordarray,index,type,id = null) {
    return new Promise((resolve,reject) => {
        if (type == "server") {
            fs.readFileSync(`databaseindexes/${index}/serverdictionary.json`, (err,data) => {
                if (err) { console.log(err) }
                else { 
                    let manipulate = data;
                    for (var prop in wordarray) {
                        try {
                            var i = manipulate.findIndex(element => element.name == prop)
                            if (i != -1) {
                                manipulate[i].total = (manipulate[i].total + word.total);
                            }
                            else {
                                manipulate.push({
                                    name: word.name,
                                    total: word.total
                                })
                            }
                            fs.writeFileSync(`databaseindexes/${index}/serverdictionary.json`, JSON.stringify(manipulate), (err) => {
                                if (err) { console.log(err) }
                                resolve("Finished");
                            })
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
            })
        }
        else {
            var typestring = "memberdictionary"
            if (type == "channel") {
                typestring = "channeldictionary"
            }
            fs.readFileSync(`databaseindexes/${index}/${typestring}.json`, (err,data) => {
                if (err) { console.log(err) }
                else { 
                    if (data[id] == undefined) { return }
                    let manipulate = data;
                    let manipulatepart = data[id];
                    for (var prop in wordarray) {
                        try {
                            var i = manipulate.findIndex(element => element.name == prop)
                            if (i != -1) {
                                manipulatepart[i].total = (manipulatepart[i].total - word.total);
                            }
                            else {
                                manipulatepart.push({
                                    name: word.name,
                                    total: word.total
                                })
                            }
                            manipulate[id] = manipulatepart;
                            fs.writeFileSync(`databaseindexes/${index}/${typestring}.json`, JSON.stringify(manipulate), (err) => {
                                if (err) { console.log(err) }
                                resolve("Finished");
                            })
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
            })
        }
    })
}

// Access the timestamps file and remove this amount.
// messages is an array of message objects, index is the server id, type is server, channel or member, 
// id is the channel or member id, if applicable
function databaseArrayRemoveTimestamps(messages,index,type,id = null) {
    return new Promise((resolve,reject) => {
        console.log("Removing timestamps "+type+" "+id +" "+index);
        if (type == "server") {
            fs.readFile(`databaseindexes/${index}/servertimestamps.json`, (err,data) => {
                console.log("Read data for "+type+" "+id)
                var maxlength = JSON.parse(data).length - 1; // We'll start at the end of the array, since our timestamps we're removing are most likely recent.
                let workingdata = JSON.parse(data); // Create a mutable array. 
                var originaltimestamp = workingdata[0];
                console.log(moment(originaltimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a"));
                var i;
                messages.forEach((message) => { 
                    i = maxlength;
                    console.log(i);
                    console.log(originaltimestamp);
                    console.log(BigInt(i)*BigInt(3600000));
                    // Check if we don't have a timestamp value to modify. We shouldn't run into this, but if we do, this should failsafe it. 
                    // Our data will become slightly inaccurate in this way, but this should prevent odd crashes
                    var mustadd = true;
                    while (mustadd == true) {
                        workingdata.push(0);
                        i++;
                        if (BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))) {
                            workingdata[i] = 1;
                            mustadd = false;
                        }
                    }
                    while (i > 0) {
                        console.log((BigInt(message.createdTimestamp))," ",(BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))," ",(BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000)))," ",i);
                        if ((BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))))&&(BigInt(message.createdTimestamp) > (BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000))))) {
                            console.log("Check!");
                            workingdata[i]--;
                            i = 0;
                        }
                        i--;
                    }
                })
                fs.writeFile(`databaseindexes/${index}/servertimestamps.json`, JSON.stringify(workingdata), (err) => {
                    if (err) { console.log(err) }
                    resolve("Finished");
                })
            });
        }
        else {
            var typestring = "membertimestamps"
            if (type == "channel") {
                typestring = "channeltimestamps"
            }
            fs.readFileSync(`databaseindexes/${index}/${typestring}.json`, (err,data) => {
                let workingdata = data; // Create a mutable array. 
                let workingdatapart = workingdata[id];
                var originaltimestamp = workingdatapart[0];
                var maxlength = originaltimestamp.length - 1; // We'll start at the end of the array, since our timestamps we're removing are most likely recent.
                var i;
                messages.forEach((message) => {
                    i = maxlength
                    // Check if we don't have a timestamp value to modify. We shouldn't run into this, but if we do, this should failsafe it. 
                    // Our data will become slightly inaccurate in this way, but this should prevent odd crashes
                    var mustadd = true;
                    while (mustadd == true) {
                        workingdata.push(0);
                        i++;
                        if (BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))) {
                            workingdata[i] = 1;
                            mustadd = false;
                        }
                    }
                    while (i > 0) {
                        console.log((BigInt(message.createdTimestamp))," ",(BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))));
                        if ((BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))))&&(BigInt(message.createdTimestamp) > (BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000))))) {
                            console.log("Check!");
                            workingdatapart[i]--;
                            i = 0;
                        }
                        i--;
                    }
                })
                workingdata[id] = workingdatapart;
                fs.writeFileSync(`databaseindexes/${index}/${typestring}.json`, workingdata, (err) => {
                    if (err) { console.log(err) }
                    resolve("Finished");
                })
            });
        }
    });
}

// Access the timestamps file and remove this amount.
// messages is an array of message objects, index is the server id, type is server, channel or member, 
// id is the channel or member id, if applicable
function databaseArrayAddTimestamps(messages,index,type,id = null) {
    return new Promise((resolve,reject) => {
        console.log("Adding timestamps "+type+" "+id +" "+index);
        if (type == "server") {
            fs.readFile(`databaseindexes/${index}/servertimestamps.json`, (err,data) => {
                console.log("Read data for "+type+" "+id)
                var maxlength = JSON.parse(data).length - 1; // We'll start at the end of the array, since our timestamps we're removing are most likely recent.
                let workingdata = JSON.parse(data); // Create a mutable array. 
                var originaltimestamp = workingdata[0];
                console.log(moment(originaltimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a"));
                var i;
                messages.forEach((message) => { 
                    i = maxlength;
                    console.log(i);
                    console.log(originaltimestamp);
                    console.log(BigInt(i)*BigInt(3600000));
                    // Check if we don't have a timestamp value to modify. This will grow the timestamp value organically with periodic checks.
                    var mustadd = true;
                    while (mustadd == true) {
                        workingdata.push(0);
                        i++;
                        if (BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))) {
                            mustadd = false;
                        }
                    }
                    while (i > 0) {
                        console.log((BigInt(message.createdTimestamp))," ",(BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))," ",(BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000)))," ",i);
                        if ((BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))))&&(BigInt(message.createdTimestamp) > (BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000))))) {
                            console.log("Check!");
                            workingdata[i]++;
                            i = 0;
                        }
                        i--;
                    }
                })
                fs.writeFile(`databaseindexes/${index}/servertimestamps.json`, JSON.stringify(workingdata), (err) => {
                    if (err) { console.log(err) }
                    resolve("Finished");
                })
            });
        }
        else {
            var typestring = "membertimestamps"
            if (type == "channel") {
                typestring = "channeltimestamps"
            }
            fs.readFileSync(`databaseindexes/${index}/${typestring}.json`, (err,data) => {
                let workingdata = data; // Create a mutable array. 
                let workingdatapart = workingdata[id];
                var originaltimestamp = workingdatapart[0];
                var maxlength = originaltimestamp.length - 1; // We'll start at the end of the array, since our timestamps we're removing are most likely recent.
                var i;
                messages.forEach((message) => {
                    i = maxlength
                    // Check if we don't have a timestamp value to modify. This will grow the timestamp value organically with periodic checks.
                    var mustadd = true;
                    while (mustadd == true) {
                        workingdata.push(0);
                        i++;
                        if (BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000)))) {
                            mustadd = false;
                        }
                    }
                    while (i > 0) {
                        console.log((BigInt(message.createdTimestamp))," ",(BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))));
                        if ((BigInt(message.createdTimestamp) < (BigInt(originaltimestamp)+(BigInt(i+1)*BigInt(3600000))))&&(BigInt(message.createdTimestamp) > (BigInt(originaltimestamp)+(BigInt(i)*BigInt(3600000))))) {
                            console.log("Check!");
                            workingdatapart[i]++;
                            i = 0;
                        }
                        i--;
                    }
                })
                workingdata[id] = workingdatapart;
                fs.writeFileSync(`databaseindexes/${index}/${typestring}.json`, workingdata, (err) => {
                    if (err) { console.log(err) }
                    resolve("Finished");
                })
            });
        }
    });
}


// This will generate word dictionaries for a given array of messages.
// Messages should be all of the messages read for a server in a single array
// userids should be a list of author ids, but not the member objects.  
// channelids should be a list of channel ids, but not channel objects. 
//
// Returns an object with serverdictionary (single array), memberdictionary (object with array properties),
// channeldictionary (object with array properties), servertimestamps (single array), channeltimestamps
// (object with array properties), and membertimestamps (object with array properties).
export async function generateArrayLookups(messages,members,channels,servertimestamp) {
    return new Promise((resolve,reject) => {
        // Objects from returned promises
        var serverdictionaryobj = [];
        var memberdictionaryobj = new Object();
        var channeldictionaryobj = new Object();
        var servertimestampsobj = [];
        var membertimestampsobj = new Object();
        var channeltimestampsobj = new Object();

        // Array container for all of our promises.
        var promisegroup = [];
    
        // First, let's generate the serverdictionary object
        promisegroup.push(new Promise((resolve,reject) => {
            separateWords(messages).then((wordlist) => {
                createWordMap(wordlist).then((wordmap) => {
                    sortByCount(wordmap).then((countedmap) => {
                        serverdictionaryobj = countedmap;
                        console.log("Resolved promise Server")
                        resolve("Resolved");
                    })
                })
            })
        }))
    
        // Let's separate messages into each user's group. 
        // We'll also push it into it's appropriate channel group while we're iterating
        var usermessagegroup = new Object;
        var channelmessagegroup = new Object;
    
        // Iterate over each message, pushing it to a usermessagegroup or channelmessagegroup as needed.
        messages.forEach((message) => {
            let userid = message.author;
            let channelid = message.channel;
            if (!Array.isArray(usermessagegroup[userid])) { usermessagegroup[userid] = [] }
            if (!Array.isArray(channelmessagegroup[channelid])) { channelmessagegroup[channelid] = [] }
            usermessagegroup[userid].push(message);
            channelmessagegroup[channelid].push(message);
        })
    
        // Create promises for each of the user groups. 
        members.each((member) => {
            if (usermessagegroup[member.id] == undefined) { return }
            // Promise for word arrays
            promisegroup.push(new Promise((resolve,reject) => {
                separateWords(usermessagegroup[member.id]).then((wordlist) => {
                    createWordMap(wordlist).then((wordmap) => {
                        sortByCount(wordmap).then((countedmap) => {
                            memberdictionaryobj[member.id] = countedmap;
                            console.log("Resolved promise member "+member.id)
                            resolve("Resolved");
                        })
                    })
                })
            }))
            // Promise for timestamps
            promisegroup.push(new Promise((resolve,reject) => {
                sortMessagesAsc(usermessagegroup[member.id]).then((sortedmessages) => {
                    timestampArray(sortedmessages,member.joinedTimestamp).then((timeArray) => {
                        membertimestampsobj[member.id] = timeArray;
                        console.log("Resolved promise member timestamp "+member.id)
                        resolve("Resolved");
                    })
                })
            }))
        });
        // Create promises for each of the channel groups
        channels.each((channel) => {
            if (channelmessagegroup[channel.id] == undefined) { return }
            // Promise for word arrays
            promisegroup.push(new Promise((resolve,reject) => {
                separateWords(channelmessagegroup[channel.id]).then((wordlist) => {
                    createWordMap(wordlist).then((wordmap) => {
                        sortByCount(wordmap).then((countedmap) => {
                            channeldictionaryobj[channel.id] = countedmap;
                            console.log("Resolved promise channel "+channel.id)
                            resolve("Resolved");
                        })
                    })
                })
            }))
            // Promise for timestamps
            promisegroup.push(new Promise((resolve,reject) => {
                sortMessagesAsc(channelmessagegroup[channel.id]).then((sortedmessages) => {
                    timestampArray(sortedmessages,channel.createdTimestamp).then((timeArray) => {
                        channeltimestampsobj[channel.id] = timeArray;
                        console.log("Resolved promise channel timestamp "+channel.id)
                        resolve("Resolved");
                    })
                })
            }))
        });

        // Create promise for the server timestamps. 
        promisegroup.push(new Promise((resolve,reject) => {
            sortMessagesAsc(messages).then((sortedmessages) => {
                timestampArray(sortedmessages,servertimestamp).then((timeArray) => {
                    servertimestampsobj = timeArray;
                    console.log("Resolved promise Server Timestamps");
                    resolve("Resolved");
                })
            })
        }))

    
        // Finally, let's wait for all of our promises to settle. When they do, return our massive object.
        Promise.all(promisegroup).then(() => {
            resolve({
                serverdictionary: serverdictionaryobj,
                memberdictionary: memberdictionaryobj,
                channeldictionary: channeldictionaryobj,
                servertimestamps: servertimestampsobj,
                membertimestamps: membertimestampsobj,
                channeltimestamps: channeltimestampsobj
            })
        })
    })
    // Why did I write this horrifying promise catastrophe. 
    // With 100 members and 50 servers, this will give close to 1000 promises to resolve (including chains) before this returns things. 
    // 500 members and 250 servers would be 4000. Here's hoping that my computer can handle it. 
    // 
    // Update (08/25/2020): 122k objects process in about 57.2 seconds. 
}

// When a message is deleted, we'll run this function to update our arrays. 
export function removeMessageArrayLookup(messages) {
    return new Promise((resolve,reject) => {
        var guildid = messages[0].guild.id;
        var promisegroup = [];

        // First, let's adjust our word counts for the server. 
        promisegroup.push(new Promise((resolve,reject) => {
            separateWordsMessages(messages).then((wordlist) => {
                createWordMap(wordlist).then((wordmap) => {
                    databaseArrayRemoveWords(wordmap,messages[0].guild.id,"server").then((result) => {
                        resolve("Resolved");
                    })
                })
            })
        }))
        // Adjust server timestamps. 
        promisegroup.push(new Promise((resolve,reject) => {
            databaseArrayRemoveTimestamps(messages,messages[0].guild.id,"server").then(((result) => {
                resolve("Resolved");
            }))
        }))

        // Next, handle channels and members sorting. 
        var channellist = [];
        var memberlist = [];
        var channelmessages = new Object();
        var membermessages = new Object();
        messages.forEach((message) => {
            if (!(channellist.includes(message.channel.id))) { channellist.push(message.channel.id) }
            if (!(memberlist.includes(message.author.id))) { memberlist.push(message.author.id) }
            if (!(channelmessages.hasOwnProperty(message.channel.id))) { channelmessages[message.channel.id] = [] }
            if (!(membermessages.hasOwnProperty(message.author.id))) { membermessages[message.author.id] = [] }
            channelmessages[message.channel.id].push(message);
            membermessages[message.author.id].push(message);
        })
        console.log(channellist);
        console.log(memberlist);
        if (channellist.length > 0) {
            channellist.forEach((channelid) => {
                promisegroup.push(new Promise((resolve,reject) => {
                    separateWordsMessages(channelmessages[channelid]).then((wordlist) => {
                        console.log(wordlist);
                        createWordMap(wordlist).then((wordmap) => {
                            databaseArrayRemoveWords(wordmap,messages[0].guild.id,"channel",channelid).then((result) => {
                                resolve("Resolved");
                            })
                        })
                    })
                }))
                promisegroup.push(new Promise((resolve,reject) => {
                    databaseArrayRemoveTimestamps(messages,messages[0].guild.id,"channel",channelid).then(((result) => {
                        resolve("Resolved");
                    }))
                }))
            })
        }
        if (memberlist.length > 0) {
            memberlist.forEach((memberid) => {
                promisegroup.push(new Promise((resolve,reject) => {
                    separateWordsMessages(membermessages[memberid]).then((wordlist) => {
                        createWordMap(wordlist).then((wordmap) => {
                            databaseArrayRemoveWords(wordmap,messages[0].guild.id,"member",memberid).then((result) => {
                                resolve("Resolved");
                            })
                        })
                    })
                }))
                promisegroup.push(new Promise((resolve,reject) => {
                    databaseArrayRemoveTimestamps(messages,messages[0].guild.id,"member",memberid).then(((result) => {
                        resolve("Resolved");
                    }))
                }))
            })
        }

        Promise.all(promisegroup).then((promises) => {
            resolve("Done");
        })
    })
}

// When a message is added, we'll run this function to update our arrays. 
export function addMessageArrayLookup(messages) {
    return new Promise((resolve,reject) => {
        var guildid = messages[0].guild.id;
        var promisegroup = [];

        // First, let's adjust our word counts for the server. 
        promisegroup.push(new Promise((resolve,reject) => {
            separateWords(messages).then((wordlist) => {
                createWordMap(wordlist).then((wordmap) => {
                    databaseArrayAddWords(wordmap,messages[0].guild.id,"server").then((result) => {
                        resolve("Resolved");
                    })
                })
            })
        }))
        // Adjust server timestamps. 
        promisegroup.push(new Promise((resolve,reject) => {
            databaseArrayAddTimestamps(messages,messages[0].guild.id,"server").then(((result) => {
                resolve("Resolved");
            }))
        }))

        // Next, handle channels and members sorting. 
        var channellist = [];
        var memberlist = [];
        var channelmessages = new Object();
        var membermessages = new Object();
        messages.forEach((message) => {
            if (!(channellist.includes(message.channel.id))) { channellist.push(message.channel.id) }
            if (!(memberlist.includes(message.author.id))) { memberlist.push(message.author.id) }
            if (!(channelmessages.hasOwnProperty(message.channel.id))) { channelmessages[message.channel.id] = [] }
            if (!(membermessages.hasOwnProperty(message.author.id))) { membermessages[message.author.id] = [] }
            channelmessages[message.channel.id].push(message);
            membermessages[message.author.id].push(message);
        })
        if (channellist.length > 0) {
            channellist.forEach((channelid) => {
                promisegroup.push(new Promise((resolve,reject) => {
                    separateWords(channelmessages[channelid]).then((wordlist) => {
                        createWordMap(wordlist).then((wordmap) => {
                            databaseArrayAddWords(wordmap,messages[0].guild.id,"channel",channelid).then((result) => {
                                resolve("Resolved");
                            })
                        })
                    })
                }))
                promisegroup.push(new Promise((resolve,reject) => {
                    databaseArrayAddTimestamps(messages,messages[0].guild.id,"channel",channelid).then(((result) => {
                        resolve("Resolved");
                    }))
                }))
            })
        }
        if (memberlist.length > 0) {
            memberlist.forEach((memberid) => {
                promisegroup.push(new Promise((resolve,reject) => {
                    separateWords(membermessages[memberid]).then((wordlist) => {
                        createWordMap(wordlist).then((wordmap) => {
                            databaseArrayAddWords(wordmap,messages[0].guild.id,"member",memberid).then((result) => {
                                resolve("Resolved");
                            })
                        })
                    })
                }))
                promisegroup.push(new Promise((resolve,reject) => {
                    databaseArrayAddTimestamps(messages,messages[0].guild.id,"member",memberid).then(((result) => {
                        resolve("Resolved");
                    }))
                }))
            })
        }

        Promise.all(promisegroup).then((promises) => {
            resolve("Done");
        })
    })
}

// This will fetch all timestamp information for the given key. 
export function getTimestamps(serverid,type,id) {
    return new Promise((resolve,reject) => {
        var returnobject = new Object();
        var typestring = "membertimestamps"
        if (type == "server") {
            try {
                fs.readFile(`databaseindexes/${serverid}/servertimestamps.json`, (err,data) => {
                    resolve(JSON.parse(data));
                });
            }
            catch (err) { console.log(err) }
        }
        else {
            if (type == "channel") { typestring = "channeltimestamps" }
            try {
                fs.readFile(`databaseindexes/${serverid}/${typestring}.json`, (err,data) => {
                    var returned = JSON.parse(data);
                    if (returned.hasOwnProperty(id)) {
                        resolve(returned[id]);
                    }
                    else {
                        resolve([]);
                    }
                });
            }
            catch (err) { console.log(err) }
        }
    })
}

// This will return a 24 hour "heat map" array. This should have a result from getTimestamps() piped into it. 
export function hourMap24(array) {
    return new Promise((resolve,reject) => {
        var manip = array;
        var startingtimestamp = manip[0];
        manip.splice(0,1);
        var workingarray = [];
        var i;
        for (i = 0; 24 > i; i++) {
            workingarray.push(0)
        }
        console.log(manip);
        i = 0;
        manip.forEach((element) => {
            workingarray[i] = workingarray[i] + parseInt(element)
            i++;
            if (i > 23) {
                i = 0;
            }
        })
        // If our index at [0] is NOT a midnight
        if (!(moment(startingtimestamp).startOf('day').isSame(moment(startingtimestamp)))) {
            var momentduration = moment.duration(moment(startingtimestamp) - moment(startingtimestamp).startOf('day')).hours();
            while (momentduration > 0) {
                // Cut the end and put it at the beginning until momentduration is 0. This will "shift" the starting back by an hour each time. 
                var slice = workingarray.pop();
                workingarray.unshift(slice);
                momentduration--;
            }
        }
        resolve(workingarray);
    });
}

// This will fetch all dictionary information for the given key. 
export function getDictionaries(serverid,type,id) {
    return new Promise((resolve,reject) => {
        var returnobject = new Object();
        var typestring = "memberdictionary"
        if (type == "server") {
            try {
                fs.readFile(`databaseindexes/${serverid}/serverdictionary.json`, (err,data) => {
                    resolve(JSON.parse(data));
                });
            }
            catch (err) { console.log(err) }
        }
        else {
            if (type == "channel") { typestring = "channeldictionary" }
            try {
                fs.readFile(`databaseindexes/${serverid}/${typestring}.json`, (err,data) => {
                    var returned = JSON.parse(data);
                    if (returned.hasOwnProperty(id)) {
                        resolve(returned[id]);
                    }
                    else {
                        resolve([]);
                    }
                });
            }
            catch (err) { console.log(err) }
        }
    })
}