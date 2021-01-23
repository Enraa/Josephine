// fork-messageadder.js

// Imports
const fs = require('fs');
const fse = require('fs-extra');
var moment = require('moment');

// Starting variables
var channeldictionary = new Object();
var memberdictionary = new Object();
var serverdictionary = new Object();
var channeltimestamp = new Object();
var membertimestamp = new Object();
var servertimestamp = [];

var treq = true;
var pulse = 0;

try {
    channeldictionary = readWordArray(JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/channeldictionary.json`)),"channel");
}
catch (err) { }
try {
    memberdictionary = readWordArray(JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/memberdictionary.json`)),"member");
}
catch (err) { }
try {
    serverdictionary = readWordArray(JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/serverdictionary.json`)),"server");
}
catch (err) { }
try {
    channeltimestamp = JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/channeltimestamps.json`));
}
catch (err) { }
try {
    membertimestamp = JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/membertimestamps.json`));
}
catch (err) { }
try {
    servertimestamp = JSON.parse(fs.readFileSync(`./databaseindexes/${process.env.SERVERID}/servertimestamps.json`));
}
catch (err) { }

console.log(process.env.SERVERID);

// Received a message object
process.on('message', (data) => {
    var command = data.slice(0,4);
    if (command == "TERM") {
        console.log("Exiting");
        saveArrays();
        process.exit();
    }
    else if (command == "SAVE") {
        saveArrays();
        process.send("Saved "+process.env.SERVERID);
    }
    else if (command == "CLR ") {
        channeldictionary = new Object();
        memberdictionary = new Object();
        serverdictionary = new Object();
        channeltimestamp = new Object();
        membertimestamp = new Object();
        servertimestamp = [];
        process.send("TREQ");
    }
    else if (command == "ADD ") {
        var dataobject = JSON.parse(data.slice(4));
        var messagewords = parseWords(dataobject.messagetext)
        messagewords.forEach((word) => {
            // Check for channel words first
            if (channeldictionary[dataobject.channel] != undefined) {
                // Increment the word.
                channeldictionary[dataobject.channel][word] = (channeldictionary[dataobject.channel][word] || 0) + 1;
            }
            else {
                channeldictionary[dataobject.channel] = new Object();
                channeldictionary[dataobject.channel][word] = (channeldictionary[dataobject.channel][word] || 0) + 1;
            }
            if (memberdictionary[dataobject.author] != undefined) {
                // Increment the word.
                memberdictionary[dataobject.author][word] = (memberdictionary[dataobject.author][word] || 0) + 1;
            }
            else {
                memberdictionary[dataobject.author] = new Object();
                memberdictionary[dataobject.author][word] = (memberdictionary[dataobject.author][word] || 0) + 1;
            }
            // Increment the word.
            serverdictionary[word] = (serverdictionary[word] || 0) + 1;
            // Try to adjust timestamps. If any of them are missing, we should request a new set of timestamps. 
        })
        if (servertimestamp[0] === undefined) {
            console.log(servertimestamp[0]);
            console.log(membertimestamp[dataobject.author]);
            console.log(channeltimestamp[dataobject.channel]);
            try {
                if (treq === true) {
                    process.send('TREQ');
                }
            }
            catch (err) { console.log("TREQ error") }
        }
        else if (servertimestamp[0] !== undefined && channeltimestamp.hasOwnProperty(dataobject.channel) === false) {
            // This is for a former channel, we'll ignore this request.
            console.log(channeltimestamp)
            console.log(dataobject.channel)
            servertimestamp = addTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
        else if (servertimestamp[0] !== undefined && membertimestamp.hasOwnProperty(dataobject.author) === false) {
            // This is for a former user, we'll ignore this request. 
            servertimestamp = addTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
        else {
            channeltimestamp[dataobject.channel] = addTimestampBit(channeltimestamp[dataobject.channel],dataobject,"channel");
            membertimestamp[dataobject.author] = addTimestampBit(membertimestamp[dataobject.author],dataobject,"member");
            servertimestamp = addTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
    }
    else if (command == "DEL ") {
        var dataobject = JSON.parse(data.slice(4));
        var messagewords = parseWords(dataobject.messagetext)
        messagewords.forEach((word) => {
            // Check for channel words first
            if (channeldictionary[dataobject.channel] != undefined) {
                // Increment the word.
                channeldictionary[dataobject.channel][word] = (channeldictionary[dataobject.channel][word] || 1) - 1;
                if (channeldictionary[dataobject.channel][word] == 0) { delete channeldictionary[dataobject.channel][word] }
            }
            if (memberdictionary[dataobject.author] != undefined) {
                // Increment the word.
                memberdictionary[dataobject.author][word] = (memberdictionary[dataobject.author][word] || 1) - 1;
                if (memberdictionary[dataobject.author][word] == 0) { delete memberdictionary[dataobject.author][word] }
            }
            // Increment the word.
            serverdictionary[word] = (serverdictionary[word] || 1) - 1;
            if (serverdictionary[word] == 0) { delete serverdictionary[word] }
        })
        if (servertimestamp[0] === undefined) {
            console.log(servertimestamp[0]);
            console.log(membertimestamp[dataobject.author]);
            console.log(channeltimestamp[dataobject.channel]);
            try {
                if (treq === true) {
                    process.send('TREQ');
                }
            }
            catch (err) { console.log("TREQ error") }
        }
        else if (servertimestamp[0] !== undefined && channeltimestamp.hasOwnProperty(dataobject.channel) === false) {
            // This is for a former channel, we'll ignore this request.
            console.log(channeltimestamp)
            console.log(dataobject.channel)
            servertimestamp = removeTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
        else if (servertimestamp[0] !== undefined && membertimestamp.hasOwnProperty(dataobject.author) === false) {
            // This is for a former user, we'll ignore this request. 
            servertimestamp = removeTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
        else {
            channeltimestamp[dataobject.channel] = removeTimestampBit(channeltimestamp[dataobject.channel],dataobject,"channel");
            membertimestamp[dataobject.author] = removeTimestampBit(membertimestamp[dataobject.author],dataobject,"member");
            servertimestamp = removeTimestampBit(servertimestamp,dataobject,"server");
            process.send("NEXT")
        }
    }
    else if (command == "TRES") {
        var dataobject = JSON.parse(data.slice(4));
        servertimestamp = dataobject.servertimestamp;
        membertimestamp = dataobject.membertimestamp;
        channeltimestamp = dataobject.channeltimestamp;
        process.send("TCOM");
    }
})

process.on('disconnect', () => {
    treq = false;
})

process.on('close', (data) => {
    process.exit();
});

// Removes a Timestamp
function removeTimestampBit(array, message) {
    var workingdata = array;
    var originaltimestamp = array[0];
    var i = workingdata.length-1;
    var timecurrent = (originaltimestamp) + (3600000*i-1)
    // We're adding a brand new entry. 
    while (timecurrent < message.timestamp) {
        i++;
        workingdata[i] = 0;
        timecurrent = timecurrent + 3600000;
    }
    // This i is not within our one hour scope, decrement each hour until we find it. 
    while ((message.timestamp < timecurrent)&&(message.timestamp < timecurrent-3600000)) {
        i--;
        timecurrent = timecurrent - 3600000;
    }
    workingdata[i] = (workingdata[i] || 0) - 1;
    if (0 > workingdata[i]) {
        workingdata[i] = 0;
    }
    return workingdata;
}

// Adds a Timestamp
function addTimestampBit(array, message, t) {
    var workingdata = array;
    var originaltimestamp = array[0];
    var i = workingdata.length-1;
    var timecurrent = (originaltimestamp) + (3600000*i-1)
    // We're adding a brand new entry. 
    while (timecurrent < message.timestamp) {
        i++;
        workingdata[i] = 0;
        timecurrent = timecurrent + 3600000;
    }
    // This i is not within our one hour scope, decrement each hour until we find it. 
    while ((message.timestamp < timecurrent)&&(message.timestamp < timecurrent-3600000)) {
        i--;
        timecurrent = timecurrent - 3600000;
    }
    workingdata[i] = (workingdata[i] || 0) + 1;
    return workingdata;
}

// Returns an array of words separated by " ";
function parseWords(string) {
    return string.split(' ');
}

// This will parse the arrayobject into an array of name; total pairs
function parseWordArray(arrayobject, type) {
    var keys = Object.keys(arrayobject);
    var returnobject = new Object();
    // Channel and Member arrays are object keyed
    if (type != "server") {
        for (const key of keys) {
            returnobject[key] = [];
            var indivkeys = Object.keys(arrayobject[key]);
            for (const wordkey of indivkeys) {
                returnobject[key].push({
                    name: wordkey,
                    total: arrayobject[key][wordkey]
                })
            }
        }
    }
    else {
        returnobject = [];
        var indivkeys = Object.keys(arrayobject);
        for (const wordkey of indivkeys) {
            returnobject.push({
                name: wordkey,
                total: arrayobject[wordkey]
            })
        }
    }
    return returnobject;
}

// This will read the arrayobject passed into it and return the way we can read on the fork. 
function readWordArray(arrayobject, type) {
    var returnarray = new Object();
    if (type != "server") {
        var keys = Object.keys(arrayobject);
        for (const key of keys) {
            returnarray[key] = new Object();
            arrayobject[key].forEach((pair) => {
                returnarray[key][pair.name] = pair.total
            })
        }
    }
    else {
        arrayobject.forEach((pair) => {
            returnarray[pair.name] = pair.total
        })
    }
    return returnarray;
}

// This will save the current arrays to file when called. 
function saveArrays() {
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/channeldictionary.json`, JSON.stringify(parseWordArray(channeldictionary,"channel")), (err) => {
        if (err) console.log(err)
    })
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/memberdictionary.json`, JSON.stringify(parseWordArray(memberdictionary,"member")), (err) => {
        if (err) console.log(err)
    })
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/serverdictionary.json`, JSON.stringify(parseWordArray(serverdictionary,"server")), (err) => {
        if (err) console.log(err)
    })
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/channeltimestamps.json`, JSON.stringify(channeltimestamp), (err) => {
        if (err) console.log(err)
    })
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/membertimestamps.json`, JSON.stringify(membertimestamp), (err) => {
        if (err) console.log(err)
    })
    fse.outputFileSync(`./databaseindexes/${process.env.SERVERID}/servertimestamps.json`, JSON.stringify(servertimestamp), (err) => {
        if (err) console.log(err)
    })
}

// Just to keep the thing alive;
setInterval(() => {
    pulse++;
}, 60000)