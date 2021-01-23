// messagefunctions.js
// This is a module to handle writing and reading to the database. 

import { fork } from 'child_process';

// Imports
var pouchDB = require('pouchdb');
pouchDB.plugin(require('pouchdb-find'));
var fs = require("fs");
var fse = require('fs-extra');
var rimraf = require("rimraf");

// Server - This is the ID of the server the message belongs to.
// Author - This is the ID of the user that sent this message. 
// Messagetext - This is the raw text of the message. 
// MessageID - This is the ID of the message
// Channel - This is the ID of the channel this message was sent in. 
// Edited - Boolean for if this message has been edited. 
// Timestamp - Integer for when this was sent. Lower is older. 
// (Embed) - Array with Picture, Video, Other

// Add message to the DB
export function pushMessage(messageobject) {
    var messagedb = new pouchDB(`databases/${messageobject.channel}`);
    if (messageobject.hasOwnProperty("embed")) {
        var doc = {
            _id: messageobject.messageid,
            author: messageobject.author,
            messagetext: messageobject.messagetext,
            channel: messageobject.channel,
            edited: messageobject.edited,
            timestamp: messageobject.timestamp,
            embed: messageobject.embed
        }
        messagedb.put(doc);
    }
    else {
        var doc = {
            _id: messageobject.messageid,
            author: messageobject.author,
            messagetext: messageobject.messagetext,
            channel: messageobject.channel,
            edited: messageobject.edited,
            timestamp: messageobject.timestamp
        }
        messagedb.put(doc)
    }
    messagedb.close()
}

// Bulk Message Add to the DB
// Each object should be numbered in order for this array. 
// We'll query the database's query to remove any duplicates. 
export function pushMessages(messageobjectarray) {
    var messagedb = new pouchDB(`databases/${messageobjectarray[0].channel}`);
    messagedb.bulkDocs(messageobjectarray).catch(err => {
        console.log(err);
    })
}

// Update last message in each channel. 

// Remove a message from a server's db (called after messagedelete event)
export function removeMessage(messageid,channelid) {
    var messagedb = new pouchDB(`databases/${channelid}`);
    messagedb.find({
        selector: {
            id: messageid
        },
        fields: ['_id', '_rev']
    }).then((result) => {
        if (result.docs.length > 0) {
            var docsmap = result.docs.map((row) => { return { _id: row._id, _rev: row._rev, _deleted: true } });
            messagedb.bulkDocs(docsmap).then((r) => {
                messagedb.close().catch(err => {
                    console.log(err);
                })
            })
        }
    })
}

// Edit a message when someone edits it (after a messageUpdate event)
export function updateMessage(messageid,channelid,newtext) {
    var messagedb = new pouchDB(`databases/${channelid}`);
    messagedb.find({
        selector: {
            id: messageid
        },
        fields: ['_id', '_rev', 'id', 'author', 'channel', 'timestamp']
    }).then((result) => {
        if (result.docs.length > 0) {
            var docsmap = result.docs.map((row) => { return { _id: row._id, _rev: row._rev, edited: true, messagetext: newtext } });
            messagedb.bulkDocs(docsmap).then((r) => {
                messagedb.close().catch(err => {
                    console.log(err);
                })
            })
        }
    })
}

// Query messages for a given channel ID. Pass an array of channel IDs to iterate over each one
export function getMessages(channelids) {
    return new Promise((resolve,reject) => {
        var promisearray = [];
        var channelarray = channelids;
        var messageobjects = [];
        // Check if we passed only one channelid. If we did, make it into an array with 1 property.
        if (!Array.isArray(channelids)) {
            channelarray = [channelids];
        }
        channelarray.forEach((channelid) => {
            promisearray.push(new Promise((resolve,reject) => {
                var messagedb = new pouchDB(`databases/${channelid}`);
                messagedb.allDocs({ include_docs: true }).then((result) => {
                    result.rows.forEach((row) => {
                        messageobjects.push(row.doc);
                    })
                    messagedb.close();
                    resolve("Done");
                });
            }))
        })
        Promise.all(promisearray).then((result) => {
            resolve(messageobjects);
        })
    })
}

// Query messsages for a user in a server. This will return an array of arrays, sorted per channel.
export async function getMessagesUser(authorid, channelidarray) {
    return new Promise((resolve,reject) => {
        var promisearray = [];
        var promiseiteration = function(channelid) {
            return new Promise((resolve,reject) => {
                try {
                    var channelgroup = [];
                    var messagedb = new pouchDB(`databases/${channelid}`);
                    messagedb.find({ 
                        selector: {author: authorid}, 
                        fields: ['id', 'author', 'messagetext', 'channel', 'edited', 'timestamp'] 
                    }).then((result) => {
                        result.docs.forEach((row) => {
                            if (row.author == authorid) {
                                channelgroup.push(row);
                            }
                        })
                        console.log(result);
                        resolve(channelgroup);
                    })
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                }
            })
        }
        channelidarray.forEach((channelid) => {
            promisearray.push(promiseiteration(channelid));
        })
        Promise.all(promisearray).then((results) => {
            resolve(results);
        }).catch((err) => {
            reject(err);
        })
    });
}

// Get a single message by ID for a channel. 
export function getMessagebyID(channelid,messageid) {
    return new Promise((resolve,reject) => {
        var messageobjects = [];
        var promisearray = new Promise((resolve,reject) => {
            var messagedb = new pouchDB(`databases/${channelid}`);
            messagedb.find({
                selector: {
                    id: messageid
                },
                fields: ['_id', '_rev', 'author', 'messagetext', 'channel', 'timestamp', 'embed', 'id']}).then((result) => {
                result.docs.forEach((row) => {
                    messageobjects.push(row);
                })
                messagedb.close();
                resolve("Done");
            });
        })
        promisearray.then((result) => {
            console.log(messageobjects)
            resolve(messageobjects[0]);
        })
    })
}

// Generate Dictionary for a server. This should be updated once per day or manually. 
// This will return a dictionary array. 
export function generateDictionary(messagearray) {

}

// Generate an array of message frequency per user. 
// This will return an ordered array from highest to lowest. 
export function generateMessageFrequency(messagearray) {

}

// Generate an array of embeds per user. 
// Type:
// 0: Photos
// 1: Videos
// 2: Websites
// This will return an ordered array from highest to lowest. 
export function generateEmbedFrequency(messagearray,type) {

}

// Generate an array of messages in a channel per user.
// This will return an array with every member's messages in a channel (even if none).
export function generateChannelArray(messagearray) {

} 

// Save the keys into a file to read later. This should take the JSON object with our properties
export function saveLastMessageKeys(keyobject) {
    fs.writeFile(`databases/lastmessagekeys.json`, JSON.stringify(keyobject), function (err) {
        if (err) console.log(err);
        console.log("Written successfully to lastmessagekeys.json");
    });
}

// Read Last Message keys from file on startup. This will return a JSON object.
// This will also purge an existing folder if it is not on this object. 
// This means that an initial scan MUST complete before it is preserved across reboots
export function readLastMessageKeys() {
    var returnobject = new Object();
    try {
        returnobject = JSON.parse(fs.readFileSync(`databases/lastmessagekeys.json`));
    }
    catch (err) {
        console.log(err);
        console.log("Using empty object - No Last Message IDs could be read.")
    }
    const getDirectories = fs.readdirSync(`databases/`, { withFileTypes: true }).filter(dirent => (dirent.isDirectory() && (!dirent.name.search('mrview')))).map(dirent => dirent.name);
    console.log(getDirectories);
    getDirectories.forEach((dir) => {
        if (!returnobject.hasOwnProperty(dir)) {
            var messagedb = new pouchDB(`databases/${dir}`);
            messagedb.destroy();
        }
    })
    return returnobject;
}

// Remove duplicate documents. This will check the doc's ID (message ID) value. Any duplicates will be marked for deletion. 
export async function cleanDuplicates() {
    const getDirectories = fs.readdir(`databases/`, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    getDirectories.forEach((dir) => {
        var messagedb = new pouchDB(`databases/${dir}`);
        messagedb.allDocs({ 
            include_docs: true
        }).then((result) => {
            let messagerows = result.rows.map((row) => { return { id: row.doc.id, _id: row.doc._id, _rev: row.doc._rev, _deleted: true } });
            var duplicates = [];
            messagerows.forEach((row) => {
                // This should find the first instance of ID and compare it to current row
                // This will return false if an ID is seen again.
                if (messagerows.findIndex((duplicate) => duplicate.id == row.id) != messagerows.indexOf(row)) {
                    duplicates.push(row);
                }
            })
            messagedb.bulkDocs(duplicates).then((res) => {
                console.log("Completed Duplicate Removal")
                messagedb.close()
            }).catch((err) => {
                console.log(err);
            })
        });
    })
}

// Destroys all databases for a given set of channel IDs and the matching database array
export function destroyDatabases(channelarray,serverid) {
    return new Promise((resolve,reject) => {
        channelarray.forEach((channelid) => {
            try {
                var messagedb = new pouchDB(`databases/${channelid}`);
                messagedb.destroy();
            }
            catch (err) {
                console.log(err)
            }
        })
        try {
            fse.removeSync(`databaseindexes/${serverid}`);
        }
        catch (err) {
            console.log(err);
        }
        resolve("Finished.");
    });
}

// This will create indexes for the given channel key. 
// This should be called when creating the backlog or if an index does not exist. 
export function createIndex(channelid) {
    var messagedb = new pouchDB(`databases/${channelid}`);
    messagedb.getIndexes().then((result) => {
        if (!(result.indexes.length > 1)) {
            messagedb.createIndex({
                index: {
                    fields: ['author', 'id']
                }
            }).then((r) => {
                messagedb.close();
            })
        }
        else {
            messagedb.close();
        }
    })
}

// This will retrieve the last message ID for a given channel key
// and compare it to the input. Returns true if before, false if after
export function messageChecked(channelid,messageid) {
    var returnobject = null;
    try {
        returnobject = JSON.parse(fs.readFileSync(`databases/lastmessagekeys.json`));
    }
    catch (err) {
        console.log(err);
    }
    if (returnobject != null) {
        if (returnobject.hasOwnProperty(channelid)) {
            console.log(BigInt(messageid));
            console.log(BigInt(returnobject[channelid]));
            if (BigInt(messageid) <= BigInt(returnobject[channelid])) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false; // This channel hasn't been indexed, so we should not try to action on it
        }
    }
}

// Experimental Fork Functions
// This will set up a fork process to add messages for the given serverid. 
export function messageAddForkSetup(serverid) {
    return fork('./internalfunctions/fork-handler.js', [], {
        env: { SERVERID: serverid }
    })
}