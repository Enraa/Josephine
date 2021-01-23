// logging.js
//
// This is the logging setup command for the server. 

// Imports
const internallogging = require('../internalfunctions/logging.js');
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
        console.log(msg.content.toLowerCase().slice(1,16))
        if (msg.content.toLowerCase().slice(1) == "logging default") {
            internallogging.defaultConfig(msg.guild);
            msg.channel.send("Created default logging configuration for this server.")
            res("updatedlogging")
        }
        else if (msg.content.toLowerCase().slice(1,16) == "logging channel") {
            var channelget = msg.mentions.channels.first();
            if (channelget != null) {
                var jsonstring = JSON.parse(fs.readFileSync(`guildconfig/${msg.guild.id}.json`));
                jsonstring.loggingchannel = channelget.id;
                fs.writeFile(`guildconfig/${msg.guild.id}.json`,JSON.stringify(jsonstring),(err) => {
                    if (err) { console.log(err) }
                    res('updatedlogging')
                })
            }
            else {
                msg.channel.send("Please tag a channel you wish to log events to.")
            }
        }
        else if (msg.content.toLowerCase().slice(1,16) == "logging help") {
            var desc = `Logging function descriptions. Use **${msg.content.toLowerCase().slice(0,8)}** to change these options.`
            var fieldarray = [];
            fieldarray.push("Logging Enabled");
            fieldarray.push("Turns logging on or off globally. This will prevent all events from sending to the logging channel.");
            fieldarray.push("Channel Created");
            fieldarray.push("Logs an event whenever a channel is created. Gives the name and creator of the channel.");
            fieldarray.push("Channel Deleted");
            fieldarray.push("Logs an event whenever a channel is deleted. Gives the name of the channel and who deleted it.");
            fieldarray.push("Channel Pins Updated");
            fieldarray.push("Logs an event whenever a channel's pins are changed. Gives the name of the channel.");
            fieldarray.push("Emoji Created");
            fieldarray.push("Logs an event whenever an emoji is added. Gives the name and creator of the emoji.");
            fieldarray.push("Emoji Deleted");
            fieldarray.push("Logs an event whenever an emoji is removed. Gives the name of the emoji and who deleted it.");
            fieldarray.push("Emoji Updated");
            fieldarray.push("Logs an event whenever an emoji's name is changed. Gives the old name and new name of the emoji, as well as who updated it.");
            fieldarray.push("Member Kicked");
            fieldarray.push("Logs an event whenever a member is removed from the server by someone. Gives the person who was kicked and who did it.");
            fieldarray.push("Member Banned");
            fieldarray.push("Logs an event whenever a member is banned from the server. Gives the person who was banned and who did it.");
            fieldarray.push("Member Leave");
            fieldarray.push("Logs an event whenever a member leaves the server voluntarily. Gives who left.");
            fieldarray.push("Member Joined");
            fieldarray.push("Logs an event whenever a member joins the server. Gives the person who just joined.");
            fieldarray.push("Invite Created");
            fieldarray.push("Logs an event whenever an invite is created. Gives the channel the invite was created for, who created it, how many uses it has, when it will expire, and the link to the invite.");
            fieldarray.push("Invite Deleted");
            fieldarray.push("Logs an event whenever an invite is removed. Gives the channel the invite was created for, who created it, how many uses it had, when it will expire, and the link to the invite.");
            fieldarray.push("Message Updated");
            fieldarray.push("Logs an event whenever a message is updated. Gives the ID of the message, who authored it, and the old and new texts of the message. *This does not occur with bot messages.*");
            fieldarray.push("Message Deleted");
            fieldarray.push("Logs an event whenever a message is deleted. Gives the ID of the message, who authored it, and the old text of the message.");
            fieldarray.push("Role Created");
            fieldarray.push("Logs an event whenever a role is created. Gives the role and who created it.");
            fieldarray.push("Role Changed");
            fieldarray.push("Logs an event whenever a role is modified. Gives the role and who modified it.");
            fieldarray.push("Role Deleted");
            fieldarray.push("Logs an event whenever a role is deleted. Gives the role and who deleted it.");
            fieldarray.push("Member Roles Updated");
            fieldarray.push("Logs an event whenever a members roles are updated. Gives the member who was updated, who performed the update, and what roles were added or removed.");
            var embed = loggingfunctions.createEmbed("Logging Help",desc,null,null,null,fieldarray);
            msg.channel.send(embed);
        }
        else {
            var jsonstring = JSON.parse(fs.readFileSync(`guildconfig/${msg.guild.id}.json`));
            // This is our function enclosed in a scope just higher than send, so we can watch for it on collectors
            function setmessagestring() {
                var loggingchanneltext = "None";
                if (jsonstring.loggingchannel != 0) {
                    loggingchanneltext = `<#${jsonstring.loggingchannel}>`
                }
                return `**Please react to change a setting. Type '${msg.content.slice(0,8)} help' for detailed info.**\n\nLogging Channel: ${loggingchanneltext}
🆗 Logging Enabled - **${jsonstring.logging_enabled ? 'ON' : 'OFF'}**\n
1️⃣ Channel Created - ${jsonstring.logging_channel_create ? ':white_check_mark: ' : '❌'}
2️⃣ Channel Deleted - ${jsonstring.logging_channel_delete ? ':white_check_mark: ' : '❌'}
3️⃣ Channel Pins Update - ${jsonstring.logging_channel_pinsupdate ? ':white_check_mark:' : '❌'}
4️⃣ Channel Update - ${jsonstring.logging_channel_update ? ':white_check_mark: ' : '❌'} - NOT IMPLEMENTED\n
5️⃣ Emoji Created - ${jsonstring.logging_emoji_create ? ':white_check_mark: ' : '❌'}
6️⃣ Emoji Deleted - ${jsonstring.logging_emoji_delete ? ':white_check_mark: ' : '❌'}
7️⃣ Emoji Updated - ${jsonstring.logging_emoji_update ? ':white_check_mark: ' : '❌'}\n
8️⃣ Member Kicked - ${jsonstring.logging_kicks_kicks ? ':white_check_mark: ' : '❌'}
9️⃣ Member Banned - ${jsonstring.logging_kicks_bans ? ':white_check_mark: ' : '❌'}
0️⃣ Member Leave - ${jsonstring.logging_kicks_leave ? ':white_check_mark: ' : '❌'}
:regional_indicator_a: Member Joined - ${jsonstring.logging_invites_join ? ':white_check_mark: ' : '❌'}\n
:regional_indicator_b: Invite Created - ${jsonstring.logging_invites_create ? ':white_check_mark: ' : '❌'}
:regional_indicator_c: Invite Deleted - ${jsonstring.logging_invites_delete ? ':white_check_mark: ' : '❌'}\n
:regional_indicator_d: Message Updated - ${jsonstring.logging_messages_update ? ':white_check_mark: ' : '❌'}
:regional_indicator_e: Message Deleted - ${jsonstring.logging_messages_delete ? ':white_check_mark: ' : '❌'}\n
:regional_indicator_f: Role Created - ${jsonstring.logging_roles_create ? ':white_check_mark: ' : '❌'}
:regional_indicator_g: Role Changed - ${jsonstring.logging_roles_update ? ':white_check_mark: ' : '❌'}
:regional_indicator_h: Role Deleted - ${jsonstring.logging_roles_delete ? ':white_check_mark: ' : '❌'}
:regional_indicator_i: Member Roles Updated - ${jsonstring.logging_roles_updatemember ? ':white_check_mark: ' : '❌'}\n
This will timeout after 60 seconds of inactivity and save the configuration as is.`
            }
            function savenewLogging() {
                var savejson = JSON.parse(fs.readFileSync(`guildconfig/${msg.guild.id}.json`));
                savejson.logging_enabled = jsonstring.logging_enabled;
                savejson.logging_channel_delete = jsonstring.logging_channel_delete;
                savejson.logging_channel_pinsupdate = jsonstring.logging_channel_pinsupdate;
                savejson.logging_channel_update = jsonstring.logging_channel_update;
                savejson.logging_emoji_create = jsonstring.logging_emoji_create;
                savejson.logging_emoji_delete = jsonstring.logging_emoji_delete;
                savejson.logging_emoji_update = jsonstring.logging_emoji_update;
                savejson.logging_kicks_kicks = jsonstring.logging_kicks_kicks;
                savejson.logging_kicks_bans = jsonstring.logging_kicks_bans;
                savejson.logging_kicks_leave = jsonstring.logging_kicks_leave;
                savejson.logging_invites_join = jsonstring.logging_invites_join;
                savejson.logging_invites_create = jsonstring.logging_invites_create;
                savejson.logging_invites_delete = jsonstring.logging_invites_delete;
                savejson.logging_messages_update = jsonstring.logging_messages_update;
                savejson.logging_messages_delete = jsonstring.logging_messages_delete;
                savejson.logging_roles_create = jsonstring.logging_roles_create;
                savejson.logging_roles_update = jsonstring.logging_roles_update;
                savejson.logging_roles_delete = jsonstring.logging_roles_delete;
                savejson.logging_roles_updatemember = jsonstring.logging_roles_updatemember;
                fs.writeFile(`guildconfig/${msg.guild.id}.json`,JSON.stringify(savejson),(err) => {
                    if (err) { console.log(err) }
                    res('updatedlogging')
                })
            }
    
    
            var msgsetup = setmessagestring();
            var msgobject = '';
            var collector = '';
            var collectorpromise = new Promise((resolve,reject) => {});
            const filter = (reaction,user) => { return user.id === msg.author.id }
            var timeout = 0;
            
            var promisething = new Promise((resolve,reject) => {
                msg.channel.send(msgsetup).then((msg) => {
                    msgobject = msg;
                    collector = msgobject.createReactionCollector(filter)
                    Promise.resolve(collectorpromise)
                    msgobject.react('🆗').then((msg) => {
                        msgobject.react('1️⃣').then((msg) => {
                            msgobject.react('2️⃣').then((msg) => {
                                msgobject.react('3️⃣').then((msg) => {
                                    msgobject.react('4️⃣').then((msg) => {
                                        msgobject.react('5️⃣').then((msg) => {
                                            msgobject.react('6️⃣').then((msg) => {
                                                msgobject.react('7️⃣').then((msg) => {
                                                    msgobject.react('8️⃣').then((msg) => {
                                                        msgobject.react('9️⃣').then((msg) => {
                                                            msgobject.react('0️⃣').then((msg) => {
                                                                msgobject.react('🇦').then((msg) => {
                                                                    msgobject.react('🇧').then((msg) => {
                                                                        msgobject.react('🇨').then((msg) => {
                                                                            msgobject.react('🇩').then((msg) => {
                                                                                msgobject.react('🇪').then((msg) => {
                                                                                    msgobject.react('🇫').then((msg) => {
                                                                                        msgobject.react('🇬').then((msg) => {
                                                                                            msgobject.react('🇭').then((msg) => {
                                                                                                msgobject.react('🇮').then((msg) => {
                                                                                                    // Finally done reacting. 
                                                                                                    console.log("Done reacting");
                                                                                                    resolve("Done");
                                                                                                });
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                    collector.on('collect', r => {
                        console.log("Collected emoji - "+r.emoji.name);
                        switch (r.emoji.name) {
                            case '🆗':
                                jsonstring.logging_enabled = !jsonstring.logging_enabled
                                break;
                            case '1️⃣':
                                jsonstring.logging_channel_create = !jsonstring.logging_channel_create
                                break;
                            case '2️⃣':
                                jsonstring.logging_channel_delete = !jsonstring.logging_channel_delete
                                break;
                            case '3️⃣':
                                jsonstring.logging_channel_pinsupdate = !jsonstring.logging_channel_pinsupdate
                                break;
                            case '4️⃣':
                                jsonstring.logging_channel_update = !jsonstring.logging_channel_update
                                break;
                            case '5️⃣':
                                jsonstring.logging_emoji_create = !jsonstring.logging_emoji_create
                                break;
                            case '6️⃣':
                                jsonstring.logging_emoji_delete = !jsonstring.logging_emoji_delete
                                break;
                            case '7️⃣':
                                jsonstring.logging_emoji_update = !jsonstring.logging_emoji_update
                                break;
                            case '8️⃣':
                                jsonstring.logging_kicks_kicks = !jsonstring.logging_kicks_kicks
                                break;
                            case '9️⃣':
                                jsonstring.logging_kicks_bans = !jsonstring.logging_kicks_bans
                                break;
                            case '0️⃣':
                                jsonstring.logging_kicks_leave = !jsonstring.logging_kicks_leave
                                break;
                            case '🇦':
                                jsonstring.logging_invites_join = !jsonstring.logging_invites_join
                                break;  
                            case '🇧':
                                jsonstring.logging_invites_create = !jsonstring.logging_invites_create
                                break; 
                            case '🇨':
                                jsonstring.logging_invites_delete = !jsonstring.logging_invites_delete
                                break; 
                            case '🇩':
                                jsonstring.logging_messages_update = !jsonstring.logging_messages_update
                                break; 
                            case '🇪':
                                jsonstring.logging_messages_delete = !jsonstring.logging_messages_delete
                                break; 
                            case '🇫':
                                jsonstring.logging_roles_create = !jsonstring.logging_roles_create
                                break; 
                            case '🇬':
                                jsonstring.logging_roles_update = !jsonstring.logging_roles_update
                                break; 
                            case '🇭':
                                jsonstring.logging_roles_delete = !jsonstring.logging_roles_delete
                                break; 
                            case '🇮':
                                jsonstring.logging_roles_updatemember = !jsonstring.logging_roles_updatemember
                                break; 
                            case '👍':
                                msgobject.edit('Logging setup completed and saved.');
                                try {
                                    // Try to clean up reactions
                                    msgobject.reactions.removeAll();
                                }
                                catch (err) { console.log(err) }
                                clearTimeout(timeout);
                                collector.stop();
                                savenewLogging();
                                break; 
                            default:
                                // The user reacted something other than what was given - rage at them. 
                                console.log('Default');
                                msg.channel.send("Please do not react with any emoji besides the ones I have provided.")
                        } 
                        if (r.emoji.name != '👍') {
                            var msgsetup = setmessagestring();
                            msgobject.edit(msgsetup)
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                msgobject.edit('Logging setup timed out - Configuration saved');
                                try {
                                    // Try to clean up reactions
                                    msgobject.reactions.removeAll();
                                }
                                catch (err) { console.log(err) }
                                collector.stop();
                                savenewLogging();
                            },60000)
                        }
                    })
                })
            })
            promisething.then((result) => {
                try { clearTimeout(timeout) } catch(err) { console.log(err) }
                timeout = setTimeout(() => {
                    msgobject.edit('Logging setup timed out - Configuration saved.');
                    try {
                        // Try to clean up reactions
                        msgobject.reactions.removeAll();
                    }
                    catch (err) { console.log(err) }
                    collector.stop();
                    savenewLogging();
                },60000)
            })
        }
    })
}