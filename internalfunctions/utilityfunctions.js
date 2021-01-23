// utilityfunctions.js
// These are general purpose functions to retrieve and return useful data. 

// Imports
const Discord = require('discord.js');

// This will return true if this person is a mod. We base this status on
// if the person has the MANAGE_MESSAGES permission. Admin also works. 
export function checkMod(msg) {
    if (msg.member.permissions.has(0x00002000)) {
        return true;
    }
    else {
        return false;
    }
}

// Sorts message objects by timestamp incrementing. 
export function sortMessageObjectsAsc(messagearray) {
    return new Promise((resolve,reject) => {
        var messagesarray = messagearray
        messagesarray.sort((a, b) => {
            if ((a.timestamp - b.timestamp) > 1) {
                console.log("HIGHER")
            }
            return a.timestamp - b.timestamp;
        });
        resolve(messagesarray);
    })
}

// Sorts dictionary objects by count. Lowest first. 
export function sortDictionaryAsc(dictionary) {
    return new Promise((resolve,reject) => {
        var dictreturn = dictionary
        dictreturn.sort((a, b) => {
            return a.total - b.total;
        });
        resolve(dictreturn);
    })
}

// Sorts dictionary objects by count. Highest first. 
export function sortDictionaryDesc(dictionary) {
    return new Promise((resolve,reject) => {
        var dictreturn = dictionary
        dictreturn.sort((a, b) => {
            return b.total - a.total;
        });
        resolve(dictreturn);
    })
}

// This is a utility function to only pad one place if necessary.
export function roundToOne(num) {
	return Math.round(num * 10) / 10;
}

// Convert degrees
export function convertDegrees(value, type) {
	var thedegrees = value;
	if (type == "f") {
		thedegrees = (thedegrees - 32) * (5 / 9);
	} else {
		thedegrees = thedegrees * (9 / 5) + 32;
	}
	return thedegrees;
}