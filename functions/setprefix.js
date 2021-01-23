// setprefix.js
//
// Sets the prefix for Josephine. 

// Imports
const utilityfunctions = require('../internalfunctions/utilityfunctions.js');
const loggingfunctions = require("../internalfunctions/logging.js");
const fs = require('fs');


export default function(msg,client) {
    return new Promise((res,rej) => {
        if (utilityfunctions.checkMod(msg) == false) {
            msg.channel.send(`This function is only available to moderators, <@${msg.author.id}>.`, { allowedMentions: { parse: [] } });
            res('none');
            return
        }
        if (msg.content.length < 12) {
            msg.channel.send(`Please add the prefix you want to change to. This can be any character (!, @, #, etc).`, { allowedMentions: { parse: [] } });
            res('none');
            return
        }
        else {
            try {
                var jsonstring = JSON.parse(fs.readFileSync(`guildconfig/${msg.guild.id}.json`));
                jsonstring.prefix = msg.content.slice(11,12);
                fs.writeFile(`guildconfig/${msg.guild.id}.json`,JSON.stringify(jsonstring),(err) => {
                    if (err) { console.log(err) }
                    res('updatedprefix')
                })
            }
            catch (err) {
                console.log(err);
                res('updatedprefix')
            }
        }
    });
}