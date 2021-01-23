// deletedatabases.js
//
// This function handles deleting the message database for the server. 

// Imports
var utilityfunctions = require('../internalfunctions/utilityfunctions.js');
var messagefunctions = require("../internalfunctions/messagefunctions.js");

export default async function (msg,client) {
    return new Promise((resolve,reject) => {
        if (utilityfunctions.checkMod(msg) == false) {
            msg.channel.send(`This function is only available to moderators, <@${msg.author.id}>.`, { allowedMentions: { parse: [] } });
            resolve();
        }
        var message = '';
        var collector = '';
        var yes = false;
        const filter = (reaction, user) => {
            return reaction.emoji.name === '👍' && user.id === msg.author.id;
        };
        msg.channel.send(`<@${msg.member.id}>, please confirm that you wish to remove this server's messages.`, { allowedMentions: { parse: [] } }).then((msgnew) => {
            message = msgnew;
            msgnew.react('👍').then((res) => {
                msgnew.react('👎').then((res) => {
                    collector = msgnew.createReactionCollector(filter, { time: 30000 });
                    collector.on('collect', (reaction,user) => {
                        yes = true;
                        msgnew.reactions.removeAll().then(() => {
                            msgnew.edit(`Removing databases for ${msg.guild.name}.`).then(() => {
                                var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
                                messagefunctions.destroyDatabases(channelkeys,msg.guild.id).then((res) => {
                                    msgnew.edit(`Databases deleted for ${msg.guild.name}. Please wait a few minutes for the server to be indexed again.`);
                                    resolve("deletedatabases");
                                })
                            })
                        })
                    })
                    collector.on('end', collected => {
                        if (!(yes)) { 
                            try {
                                msgnew.reactions.removeAll().then(() => {
                                    msgnew.edit('Database delete request aborted.');
                                    resolve();
                                })
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        console.log("Done"); 
                    })
                })
            })
        })
    })
}