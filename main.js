// Module Imports
const Discord = require("discord.js");
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });
const moment = require("moment");
const fs = require("fs");
const fse = require('fs-extra');

// My Modules
const messagefunctions = require("./internalfunctions/messagefunctions.js");
const algorithmfunctions = require("./internalfunctions/algorithmfunctions.js");
const loggingfunctions = require("./internalfunctions/logging.js");
const drawingfunctions = require("./internalfunctions/drawingfunctions.js");

// Variables
const functionfolder = './functions/'
const internalfunctionfolder = './internalfunctions/'
const functioninteractionfolder = './functions-interaction/'
const configfolder = './guildconfig/'
const defaultprefix = "!";
const channelchecktimer = 1800000

// Server specific variables - these are updated globally to limit read/writes
var functionarray = [];
var functionarrayinteraction = [];
var loggingchannel = [];
var logging_enabled = [];
var logging_channel_create = [];
var logging_channel_delete = [];
var logging_channel_pinsupdate = [];
var logging_channel_update = [];
var logging_emoji_create = [];
var logging_emoji_delete = [];
var logging_emoji_update = [];
var logging_kicks_kicks = [];
var logging_kicks_bans = [];
var logging_kicks_leave = [];
var logging_invites_join = [];
var logging_invites_create = [];
var logging_invites_delete = [];
var logging_messages_update = [];
var logging_messages_delete = [];
var logging_roles_create = [];
var logging_roles_update = [];
var logging_roles_delete = [];
var logging_roles_updatemember = [];


var logging_channel = [];
var logging_emoji = [];
var logging_invites = [];
var logging_messages = [];
var logging_roles = [];
var serverprefix = new Object();


var servers = '';
var serversi = 0;
var currdivide = 0;
var intervalcheck = 0;

var messagechecktimer = 0;
var messagebucket = new Object();
var threads = [];
var lastmessageids = new Object();
var backlogmessageids = new Object();
var newchecks = new Object();
var channelchecking = new Object();
var roletimer = new Object();
var memberroletimer = new Object();
var messagedeletedtimers = new Object();
var messagesdeleted = new Object();
var collectors = new Object();
var channelthreads = 8;

var messageforks = new Object();

const sleep = milliseconds => {
	// Sleep function
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};

// Helper function to open a module again fresh. 
function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

// Events - These should direct to individual functions
// Ready is called when the client logs in and is able to handle Discord events. 
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    lastmessageids = messagefunctions.readLastMessageKeys();
    updateFunctions();
    updateServerPrefixes();
    updateServerConfiguration();
    setInitChannelChecks();
    servers = Array.from(client.guilds.cache.values());
    createForkHandlers(servers.map(server => server.id));
    currdivide = (channelchecktimer / servers.length)
    //messagefunctions.cleanDuplicates();
    //client.setInterval(() => { messagefunctions.cleanDuplicates() },2*channelchecktimer);
    client.setInterval(async () => { setChannelChecks() },channelchecktimer);
    client.setInterval(async () => { saveForkHandlers() },channelchecktimer);
    // intervalcheck = client.setInterval(async () => { checkServerIndexes(true) },currdivide);
    // client.setInterval(() => { checkServerIndexes(true) },604800000);
    checkMessages();
    interactionSetup();
});
// Invalidated is called when the bot's session is no longer active. We should relog in. 
client.on("invalidated", () => {
    client.destroy();
    console.log(`Session was invalided at ${moment.now()}`)
    console.log(` `);
    login();
});
// Message is called whenever someone sends a message. We should try to discard as early as possible. 
client.on("message", async (msg) => {
    // I can update the function list while the bot is still running with this. 
    if (msg.content.search("updatefunctions") == 0 && msg.author.id == '125093095405518850') {
        try {
            updateFunctions();
        }
        catch (err) {
            console.log(err);
        }
    }
    // List all guilds that Josephine is in.
    if (msg.content.search("listguild") == 0 && msg.author.id == '125093095405518850') {
        try {
            getGuilds(msg);
        }
        catch (err) {
            console.log(err);
        }
    }
    // Leave a guild that Josephine is in.
    if (msg.content.search("leaveguild") == 0 && msg.author.id == '125093095405518850') {
        try {
            var slice = msg.content.slice(11)
            var guild = client.guilds.cache.find(guild => guild.id == slice)
            guild.leave().then((res) => { msg.channel.send("Left guild with ID "+slice) }).catch((err) => { console.log(err) })
        }
        catch (err) {
            console.log(err);
        }
    }
    // This is a message with a photo that the user wants spoiler'd.
    if (msg.content.search("spoilerthis") == 0) {
        // Check if there's an attachment and if we can repost it
        if ((msg.attachments.length != 0)&&(msg.channel.permissionsFor(msg.guild.me).has(['SEND_MESSAGES','MANAGE_MESSAGES']))) {
            var attachments = [];
            msg.attachments.forEach((att) => {
                attachments.push({
                    attachment: att.attachment,
                    name: `SPOILER_${att.name}`
                })
            })
            msg.channel.send(`<@${msg.author.id}>: ${msg.content.slice(11)}`, { files: attachments })
            msg.delete();
        }
    }
    // This is a test function for whatever we're trying to do. 
    if (msg.content.search('testmessages') == 0 && msg.author.id == '125093095405518850') {
        try {
            var channelkeys = msg.guild.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
            var messagetext = 'Messages per channel:\n';
            var messagearray = messagefunctions.getMessagesUser(msg.author.id,channelkeys).then((result) => {
                result.forEach((arr) => {
                    if (arr.length > 0) {
                        try { messagetext = `${messagetext}\n<#${arr[0].channel}> - ${arr.length}` } catch (err) { console.log(err) };
                    }
                })
                msg.channel.send(messagetext);
            });   
        }   
        catch (err) {
            console.log(err); 
        } 
    }
    if (msg.content.search('graphtest') == 0 && msg.author.id == '125093095405518850') {
        try {
            algorithmfunctions.getTimestamps(msg.guild.id,"member",msg.author.id).then((arrayblob) => {
                algorithmfunctions.hourMap24(arrayblob).then((array) => {
                    drawingfunctions.createActivityGraphHourly(array,msg.member.displayName).then((buffer) => {
                        msg.channel.send({
                            files: [{
                                attachment: buffer,
                                name: "Test Graph Name.jpg"
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
    if (msg.content.search('forceserverindexes') == 0 && msg.author.id == '125093095405518850') {
        checkServerIndexes(true);
    }
    if (msg.content.search('debugserverthreads') == 0 && msg.author.id == '125093095405518850') {
        console.log(`channelthreads: ${channelthreads}`);
        console.log('channelchecking: ',channelchecking);
        console.log('lastmessageids: ',lastmessageids);
        console.log('backlogmessageids: ',backlogmessageids);
    }
    if (msg.content.search('sorttest') == 0 && msg.author.id == '125093095405518850') {
        try {
            var loggingchannel = fetchLoggingChannel(msg.guild.id);
            loggingchannel.send(`<@${msg.author.id}> test!`, { allowedMentions: { parse: [] } });
        }
        catch (err) {
            console.log(err);
        }
    }
    if (msg.content.search('pingtest') == 0 && msg.author.id == '125093095405518850') {
        msg.channel.send(`<@!${msg.author.id}>, <@!612313906295209985>, <@!504377251006251020>`,{ allowedMentions: { parse: ['roles'] } });
        msg.channel.send(`<@${msg.author.id}>, <@612313906295209985>, <@504377251006251020>`,{ allowedMentions: { parse: ['roles'] } });
    }
    // Now we will check to see if the message starts with the server prefix. 
    // DM channels will have very limited functionality
    if (msg.channel.type != "text") {

    } 
    else {
        newchecks[msg.channel.id] = true;
        if (serverprefix.hasOwnProperty(msg.guild.id)) {
            if (msg.content.search(serverprefix[msg.guild.id]) == 0) {
                // Variable to action on something in main script if needed
                var callbackfunction = 0;
                // Iterate over each command in functions and see if it matches.
                functionarray.forEach(async function(command) {
                    msg.channel.stopTyping(1);
                    if (msg.content.search(command) == 1) {
                        console.log(command);
                        // Import that function and use it. 
                        let imported = await requireUncached(`${functionfolder}${command}.js`);
                        let act = imported.default;

                        msg.channel.startTyping(1);

                        var returned = await act(msg,client);
                        try {
                            Promise.resolve(returned).then((res) => {
                                if (res == "deletedatabases") {
                                    console.log("Destroyed Databases");
                                    lastmessageidpurge(msg.guild);
                                }
                                if (res == "updatedlogging") {
                                    console.log("Updating Logging");
                                    updateServerConfiguration();
                                }
                                if (res == "updatedprefix") {
                                    console.log("Updating Prefixes");
                                    updateServerPrefixes();
                                }
                                msg.channel.stopTyping(true);
                            })
                        }
                        catch (err) {
                            console.log(err);
                        }
                        if (returned != undefined) { // We had something to pass back to main handler
                            switch (returned) {
                                case 'updatePrefixes':
                                    updateServerPrefixes();
                                    break;
                                default:
                                    console.log(returned);
                            }
                        }
                    }
                })
            }
        }
        else {
            if (msg.member.user.id != client.user.id) {
                loggingfunctions.defaultConfig(msg.guild).then((result) => {
                    updateServerPrefixes();
                    updateServerConfiguration();
                    msg.channel.send(`Created default configuration for this server. Please tag me with the word 'help' or use ${defaultprefix}help for a list of commands.`);
                })
            }
        }
    }
});
// Interactions Responding
client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    console.log(command);
    console.log(args);

    if (functionarrayinteraction.includes(command)) {
        var functionimp = await requireUncached(`${functioninteractionfolder}/${command}.js`);
        let act = functionimp.default
        client.channels.resolve(interaction.channel_id).startTyping();

        var returned = await act(interaction,args,client);
        client.channels.resolve(interaction.channel_id).stopTyping();
    }
    //if (command == 'hello') {
    //    client.api.interactions(interaction.id, interaction.token).callback.post({
    //        data: {
    //            type: 4,
    //            data: {
    //                content: "Hello World!"
    //            }
    //        }
    //    })
    //}
})

// Server is joined.
client.on("guildCreate", (guild) => {
    loggingfunctions.defaultConfig(guild).then((result) => {
        servers = Array.from(client.guilds.cache.values());
        currdivide = (servers.length / channelchecktimer);
        updateServerPrefixes();
        updateServerConfiguration();
    })
});
// Server is left.
client.on("guildDelete", (guild) => {
    servers = Array.from(client.guilds.cache.values());
    currdivide = (servers.length / channelchecktimer);
    updateServerPrefixes();
});

// Events for logging channels
// Channels - When a channel is created, deleted or updated, or their pins are updated. 
client.on("channelCreate", async (channel) => {
    if (channel.type == "text") {
        var loggingchannel = fetchLoggingChannel(channel.guild.id);
        if ((loggingchannel != null)&&(logging_channel_create[channel.guild.id] != false)) {
            var auditlogentry = fetchAuditLog(10,channel.guild).then((returned) => {
                var parent = "";
                var thumbnail = null;
                var executorname = "";
                if (returned !== undefined) {
                    thumbnail = returned.executor.displayAvatarURL();
                    executorname = ` by <@${returned.executor.id}>`
                };
                if (channel.parent) {
                    parent = ` under category ${channel.parent.name}`
                }
                var desc = `<#${channel.id}> was created${executorname}${parent}.`
                var embed = loggingfunctions.createEmbed("Channel Created",desc,null,thumbnail,null,null);
                loggingchannel.send(embed);
            });
        }
    }
});
client.on("channelDelete", (channel) => {
    if (channel.type == "text") {
        var loggingchannel = fetchLoggingChannel(channel.guild.id);
        if ((loggingchannel != null)&&(logging_channel_delete[channel.guild.id] != false)) {
            var auditlogentry = fetchAuditLog(12,channel.guild).then((returned) => {
                console.log(returned);
                console.log(returned.changes.find(element => element.key = 'name').old);
                var parent = "";
                var thumbnail = null;
                var executorname = "";
                if (returned !== undefined) {
                    thumbnail = returned.executor.displayAvatarURL();
                    executorname = ` by <@${returned.executor.id}>`
                };
                if (channel.parent) {
                    parent = ` under category ${channel.parent.name}`
                }
                var desc = `#${returned.changes.find(element => element.key = 'name').old} was deleted${executorname}${parent}.`
                var embed = loggingfunctions.createEmbed("Channel Deleted",desc,null,thumbnail,null,null);
                loggingchannel.send(embed);
            });
        }
    }
});
client.on("channelPinsUpdate", (channel,time) => {
    if (channel.type == "text") {
        var loggingchannel = fetchLoggingChannel(channel.guild.id);
        if ((loggingchannel != null)&&(logging_channel_pinsupdate[channel.guild.id] != false)) {
            var thumbnail = null;
            var executorname = "";
            var desc = `<#${channel.id}>'s pins were updated${executorname}.`
            var embed = loggingfunctions.createEmbed("Channel Pins Updated",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        }
    }
});
client.on("channelUpdate", () => {

});
// Emoji - When an emoji is created, deleted or updated
client.on("emojiCreate", (emoji) => {
    var loggingchannel = fetchLoggingChannel(emoji.guild.id);
    if ((loggingchannel != null)&&(logging_emoji_create[emoji.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(60,emoji.guild).then((returned) => {
            var thumbnail = null;
            var executorname = "";
            if (returned !== undefined) {
                thumbnail = returned.executor.displayAvatarURL();
                executorname = ` by <@${returned.executor.id}>`
            };
            var desc = `${emoji} was created${executorname}.\n\n**Emoji Name:** ${emoji.name}.`
            var embed = loggingfunctions.createEmbed("Emoji Created",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        });
    }
});
client.on("emojiDelete", (emoji) => {
    var loggingchannel = fetchLoggingChannel(emoji.guild.id);
    if ((loggingchannel != null)&&(logging_emoji_delete[emoji.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(62,emoji.guild).then((returned) => {
            var thumbnail = null;
            var executorname = "";
            if (returned !== undefined) {
                thumbnail = returned.executor.displayAvatarURL();
                executorname = ` by <@${returned.executor.id}>`
            };
            var desc = `${emoji.name} was deleted${executorname}.`
            var embed = loggingfunctions.createEmbed("Emoji Deleted",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        });
    }
});
client.on("emojiUpdate", (emoji,newemoji) => {
    var loggingchannel = fetchLoggingChannel(emoji.guild.id);
    if ((loggingchannel != null)&&(logging_emoji_update[emoji.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(61,emoji.guild).then((returned) => {
            var thumbnail = null;
            var executorname = "";
            if (returned !== undefined) {
                thumbnail = returned.executor.displayAvatarURL();
                executorname = ` by <@${returned.executor.id}>`
            };
            var desc = `${newemoji} was modifed${executorname}.\n\n**Old Name:** ${emoji.name}\n**New Name:** ${newemoji.name}`
            var embed = loggingfunctions.createEmbed("Emoji Modified",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        });
    }
});
// Kicks/Bans - When someone is removed from a guild.
client.on("guildBanAdd", (guild,user) => {
    //var loggingchannel = fetchLoggingChannel(member.guild.id);
    //fetchAuditLog(22,guild).then((returned2) => {
    //    if (returned2 != undefined) {
    //        if ((returned2.target.id == user.id)) {
    //            var thumbnail = null;
    //            var executorname = "";
    //            var displayname = `${user.username}#${user.discriminator}`
    //            if (returned2 !== undefined) {
    //                thumbnail = returned2.executor.displayAvatarURL();
    //                executorname = ` by <@${returned2.executor.id}>`
    //            };
    //            var desc = `${displayname} was banned${executorname}.\n`
    //            var embed = loggingfunctions.createEmbed("Member Banned",desc,null,thumbnail,null,null);
    //            loggingchannel.send(embed);                                
    //        }
    //    }
    //});
});
client.on("guildMemberRemove", (member) => {
    var loggingchannel = fetchLoggingChannel(member.guild.id);
    if (loggingchannel != null) {
        // Check if the member was kicked
        var auditlogentry = fetchAuditLog(20,member.guild).then((returned) => {
            if (returned != undefined) {
                // Check to see if this is the member we're working with AND it's not a past event. 
                if ((returned.target.id == member.user.id) && (member.joinedTimestamp < returned.createdTimestamp) && (logging_kicks_kicks[member.guild.id] != false)) {
                    console.log("They're the same!");
                    var thumbnail = null;
                    var executorname = "";
                    var displayname = `${member.user.username}#${member.user.discriminator}`
                    if (member.nickname != undefined) {
                        displayname = `${member.nickname} (${member.user.username}#${member.user.discriminator})`
                    }
                    if (returned !== undefined) {
                        thumbnail = returned.executor.displayAvatarURL();
                        executorname = ` by <@${returned.executor.id}>`
                    };
                    var desc = `${displayname} was kicked${executorname}.\n`
                    var embed = loggingfunctions.createEmbed("Member Kicked",desc,null,thumbnail,null,null);
                    loggingchannel.send(embed);
                }
                else {
                    // Check if the member was banned. 
                    fetchAuditLog(22,member.guild).then((returned2) => {
                        if ((returned2 != undefined)&&(logging_kicks_bans[member.guild.id] != false)) {
                            if ((returned2.target.id == member.user.id) && (member.joinedTimestamp < returned2.createdTimestamp)) {
                                var thumbnail = null;
                                var executorname = "";
                                var displayname = `${member.user.username}#${member.user.discriminator}`
                                if (member.nickname != undefined) {
                                    displayname = `${member.nickname} (${member.user.username}#${member.user.discriminator})`
                                }
                                if (returned2 !== undefined) {
                                    thumbnail = returned2.executor.displayAvatarURL();
                                    executorname = ` by <@${returned2.executor.id}>`
                                };
                                var desc = `${displayname} was banned${executorname}.\n`
                                var embed = loggingfunctions.createEmbed("Member Banned",desc,null,thumbnail,null,null);
                                loggingchannel.send(embed);                                
                            }
                        }
                        else {
                            if (logging_kicks_leave[member.guild.id] != false) {
                                var displayname = `${member.user.username}#${member.user.discriminator}`
                                if (member.nickname != undefined) {
                                    displayname = `${member.nickname} (${member.user.username}#${member.user.discriminator})`
                                }
                                var desc = `${displayname} was has left the server.\n`
                                var embed = loggingfunctions.createEmbed("Member Left",desc,null,null,null,null);
                                loggingchannel.send(embed);
                            }
                        }
                    });
                }
            }
            else {
                if (logging_kicks_leave[member.guild.id] != false) {
                    var displayname = `${member.user.username}#${member.user.discriminator}`
                    if (member.nickname != undefined) {
                        displayname = `${member.nickname} (${member.user.username}#${member.user.discriminator})`
                    }
                    var desc = `${displayname} was has left the server.\n`
                    var embed = loggingfunctions.createEmbed("Member Left",desc,null,null,null,null);
                    loggingchannel.send(embed);
                }
            }
        });
    }
});
// Invites - When an invite is generated or deleted. Additionally when someone joins
client.on("inviteCreate", (invite) => {
    var loggingchannel = fetchLoggingChannel(invite.channel.guild.id);
    if ((loggingchannel != null)&&(logging_invites_create[invite.guild.id] != false)) {
        var inviter = '';
        var thumbnail = null;
        var usestext = 'There is an unlimited amount of uses. ';
        var agetext = 'This invite will not expire. ' 
        if (invite.inviter != undefined) {
            inviter = ` by <@${invite.inviter.id}>`
            thumbnail = invite.inviter.displayAvatarURL();
        }
        if ((invite.maxUses != undefined) && (invite.maxUses != 0)) {
            usestext = `There are ${invite.maxUses} uses.`
        }
        if ((invite.maxAge != undefined) && (invite.maxAge != 0)) {
            agetext = `This invite will expire in ${86400/3600} hours.`
        }
        var desc = `An invite was created for <#${invite.channel.id}>${inviter}.\n${usestext}\n${agetext}\nhttps://discord.gg/${invite.code}`
        var embed = loggingfunctions.createEmbed("Invite Created",desc,null,thumbnail,null,null);
        loggingchannel.send(embed);
    }
});
client.on("inviteDelete", (invite) => {
    var loggingchannel = fetchLoggingChannel(invite.channel.guild.id);
    if ((loggingchannel != null)&&(logging_invites_delete[invite.guild.id] != false)) {
        console.log(invite);
        var inviter = '';
        var thumbnail = null;
        var usestext = 'There was an unlimited amount of uses. ';
        var agetext = 'This invite did not expire. ' 
        if (invite.inviter != undefined) {
            inviter = ` by <@${invite.inviter.id}>`
            thumbnail = invite.inviter.displayAvatarURL();
        }
        if ((invite.maxUses != undefined) && (invite.maxUses != 0)) {
            usestext = `There are ${invite.maxUses} uses.`
        }
        if ((invite.maxAge != undefined) && (invite.maxAge != 0)) {
            agetext = `This invite will expire in ${86400/3600} hours.`
        }
        var desc = `An invite for <#${invite.channel.id}>${inviter} was deleted.\n${usestext}\n${agetext}\n**Invite Code:** ${invite.code}`
        var embed = loggingfunctions.createEmbed("Invite Deleted",desc,null,thumbnail,null,null);
        loggingchannel.send(embed);
    }
});
client.on("guildMemberAdd", (member) => {
    var loggingchannel = fetchLoggingChannel(member.guild.id);
    if ((loggingchannel != null)&&(logging_invites_join[member.guild.id] != false)) {
        var displayname = `${member.user.username}#${member.user.discriminator}`
        var desc = `${displayname} has joined the server.\n`
        var embed = loggingfunctions.createEmbed("Member Joined",desc,null,null,null,null);
        loggingchannel.send(embed);
    }
});
// Messages - When a message is deleted or updated. Sent will be handled above. 
client.on("messageDelete", async (msgin) => {
    var msg;
    var authorid;
    var messagecontent;
    if (msgin.partial) {
        await messagefunctions.getMessagebyID(msgin.channel.id,msgin.id).then((result) => {
            authorid = result.author;
            messagecontent = result.messagetext;
            msg = new Object();
            msg.id = msgin.id;
            msg.createdTimestamp = result.timestamp;
            msg.guild = msgin.guild;
            msg.channel = msgin.channel;
            msg.author = new Object();
            msg.author.id = result.author;
            msg.cleanContent = result.messagetext;
            msg.content = result.messagetext;
            msg.timestamp = result.timestamp;
        })
    }
    else { 
        msg = msgin;
        msg.timestamp = msgin.createdTimestamp;
        authorid = msgin.author.id;
        messagecontent = msgin.cleanContent;
    }
    if ((BigInt(lastmessageids[msg.channel.id]) > BigInt(msg.id))) {
        //messageforks[msg.guild.id].send(`DEL ${JSON.stringify(msg)}`)
        messagefunctions.removeMessage(msg.id,msg.channel.id);
        // Check if a message was recently deleted. If it wasn't, then set a timeout for it. 
        // This will blob up bulk deletes instead of handling them one by one. 
        console.log(messagefunctions.messageChecked(msg.channel.id,msg.id))
        if (messagefunctions.messageChecked(msg.channel.id,msg.id) == true) {
            if (messagedeletedtimers[msg.guild.id] == undefined) {
                messagesdeleted[msg.guild.id] = [msg];
                messagedeletedtimers[msg.guild.id] = setTimeout(() => {
                    //algorithmfunctions.removeMessageArrayLookup(messagesdeleted[msg.guild.id]);
                    messagedeletedtimers[msg.guild.id] = undefined;
                }, 15000);
            }
            else {
                messagesdeleted[msg.guild.id].push(msg);
            }
        }
    }
    try {
        var loggingchannel = fetchLoggingChannel(msg.guild.id);
        if ((loggingchannel != null)&&(logging_messages_delete[msgin.guild.id] != false)) {
            var msgauthor = client.users.cache.find(user => user.id == authorid);
            var thumbnail = msgauthor.displayAvatarURL();
            var desc = `Message ID ${msg.id} from <@${authorid}> was deleted.\n\n**Text:** ${messagecontent.slice(0,1600)}`
            var embed = loggingfunctions.createEmbed("Message Deleted",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        }
    }
    catch (err) {
        console.log(err);
    }
});
client.on("messageUpdate", async (oldmsg,newmsg) => {
    var botstatus;
    if (oldmsg.partial) { 
        await oldmsg.fetch().then((msg) => { botstatus = msg.author.bot })
    }
    else {
        botstatus = oldmsg.author.bot;
    }
    // If this is a bot, or if the message hasn't been checked yet, or if we're backlogging the channel, ignore this. 
    if ((botstatus == true)||(BigInt(lastmessageids[oldmsg.channel.id]) < BigInt(oldmsg.id))||(backlogmessageids[oldmsg.channel.id] != undefined)) { return };
    var msg;
    var authorid;
    var messagecontent;
    // If this is a bot message, ignore it. Bots often modify their own messages anyway. 
    if (oldmsg.partial) { 
        await messagefunctions.getMessagebyID(oldmsg.channel.id,oldmsg.id).then((result) => {
            authorid = result.author;
            messagecontent = result.messagetext;
            msg = new Object();
            msg.id = oldmsg.id;
            msg.createdTimestamp = result.timestamp;
            msg.guild = oldmsg.guild;
            msg.channel = oldmsg.channel;
            msg.author = new Object();
            msg.author.id = result.author;
            msg.cleanContent = result.messagetext;
            msg.content = result.messagetext;
        });
    }
    else { 
        msg = oldmsg;
        authorid = oldmsg.author.id;
        messagecontent = oldmsg.cleanContent;
    }
    messagefunctions.updateMessage(newmsg.id, newmsg.channel.id, ''+newmsg.content);
    //algorithmfunctions.removeMessageArrayLookup([msg]).then((res) => {
    //    algorithmfunctions.addMessageArrayLookup([msg])
    //});
    try {
        var loggingchannel = fetchLoggingChannel(newmsg.guild.id);
        if ((loggingchannel != null)&&(logging_messages_update[oldmsg.guild.id] != false)) {
            var thumbnail = newmsg.author.displayAvatarURL();
            var desc = `Message ID ${newmsg.id} from <@${newmsg.author.id}> was modified.\n\n**Old Text:** ${msg.cleanContent.slice(0, 850)}\n**New Text:** ${newmsg.cleanContent.slice(0, 850)}`
            var embed = loggingfunctions.createEmbed("Message Modified",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        }
    }
    catch (err) {
        console.log(err);
    }  
});
// Roles - When a role is created, deleted or updated
client.on("roleCreate", (role) => {
    var loggingchannel = fetchLoggingChannel(role.guild.id);
    if ((loggingchannel != null)&&(logging_roles_create[role.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(30,role.guild).then((returned) => {
            var thumbnail = returned.executor.displayAvatarURL();
            var desc = `Role ${role} was created by <@${returned.executor.id}>.`
            var embed = loggingfunctions.createEmbed("Role Created",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        })
    }
});
client.on("roleDelete", (role) => {
    var loggingchannel = fetchLoggingChannel(role.guild.id);
    if ((loggingchannel != null)&&(logging_roles_delete[role.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(32,role.guild).then((returned) => {
            var thumbnail = returned.executor.displayAvatarURL();
            var desc = `Role @${role.name} was deleted by <@${returned.executor.id}>.`
            var embed = loggingfunctions.createEmbed("Role Deleted",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        })
    }
});
client.on("roleUpdate", (oldrole,newrole) => {
    if (roletimer[oldrole.guild.id] != undefined) { return }
    roletimer[oldrole.guild.id] = true;
    setTimeout(() => {
        roletimer[oldrole.guild.id] = undefined;
        roletimer = JSON.parse(JSON.stringify(roletimer));
    },15000)
    var loggingchannel = fetchLoggingChannel(oldrole.guild.id);
    if ((loggingchannel != null)&&(logging_roles_update[oldrole.guild.id] != false)) {
        var auditlogentry = fetchAuditLog(31,oldrole.guild).then((returned) => {
            var thumbnail = returned.executor.displayAvatarURL();
            var desc = `Role ${newrole} was modified by <@${returned.executor.id}>.`
            var embed = loggingfunctions.createEmbed("Role Modified",desc,null,thumbnail,null,null);
            loggingchannel.send(embed);
        })
    }
});
client.on("guildMemberUpdate", (oldmember,newmember) => {
    // This member's roles were not updated recently.
    if (!memberroletimer.hasOwnProperty(oldmember.id)) {
        memberroletimer[oldmember.id] = setTimeout(() => {
            var loggingchannel = fetchLoggingChannel(oldmember.guild.id);
            if ((loggingchannel != null)&&(logging_roles_updatemember[oldmember.guild.id] != false)) {
                var auditlogentry = fetchAuditLog(25,oldmember.guild).then((returned) => {
                    if (returned != undefined) {
                        // Check to see if this is the member we're working with. 
                        if ((returned.target.id == oldmember.id)) {
                            var rolelistold = oldmember.roles.cache;
                            var rolelistnew = oldmember.guild.members.cache.get(oldmember.id).roles.cache;
                            // Fetch all roles that are not on the new member. These were removed. 
                            var oldtest = rolelistold.filter(role => (rolelistnew.get(role.id) == undefined));
                            // Fetch all roles that are on the new member but not the old. These were added.
                            var newtest = rolelistnew.filter(role => (rolelistold.get(role.id) == undefined));
                            var thumbnail = returned.executor.displayAvatarURL();
                            var removedtext = '';
                            var addedtext = '';
                            if (Array.from(oldtest.values()).length > 0) {
                                removedtext = "**Removed Roles:** "
                                oldtest.each((role) => {
                                    removedtext = removedtext + `${role}, `
                                })
                                removedtext = removedtext.slice(0,-2);
                                removedtext = removedtext + "\n"
                            }
                            if (Array.from(newtest.values()).length > 0) {
                                addedtext = "**Added Roles:** "
                                newtest.each((role) => {
                                    addedtext = addedtext + `${role}, `
                                })
                                addedtext = addedtext.slice(0,-2);
                            }
                            // This person only updated their username or something. 
                            if (removedtext === addedtext) { return }
                            var desc = `Roles for <@${oldmember.id}> were updated by <@${returned.executor.id}>.\n\n${removedtext}${addedtext}`
                            var embed = loggingfunctions.createEmbed("Roles Updated",desc,null,thumbnail,null,null);
                            loggingchannel.send(embed);
                        }
                    }
                });
            }
            memberroletimer[oldmember.id] = undefined;
            try {
                memberroletimer = JSON.parse(JSON.stringify(memberroletimer));
            }
            catch (err) {
                
            }
        },15000)
    }
})
client.on('messageReactionAdd', async (reaction,user) => {
    var inputreaction = reaction;
    var message = reaction.message
    if (reaction.partial == true) {
        console.log("waiting")
        await reaction.fetch().then(async (rea) => {
            inputreaction = rea;
            await inputreaction.message.fetch().then((msg) => {
                message = msg;
                console.log("waited message")
            })
            console.log("waited")
        })
    }
    if ((message.author.id == client.user.id) && (message.embeds != undefined) && (user.id != client.user.id)) {
        if (message.embeds[0].footer.text == "/poll") { // This is a poll message we're responding to.
            var functionimp = await requireUncached(`${functioninteractionfolder}/poll.js`);
            let act = functionimp.newReaction(message,client);
        }
    }
})
client.on('messageReactionRemove', async (reaction,user) => {
    var inputreaction = reaction;
    if (reaction.partial == true) {
        await reaction.fetch().then((rea) => {
            inputreaction = rea
        })
    }
    if ((inputreaction.message.author.id == client.user.id) && (inputreaction.message.embeds != undefined) && (user.id != client.user.id)) {
        if (inputreaction.message.embeds[0].footer.text == "/poll") { // This is a poll message we're responding to.
            var functionimp = await requireUncached(`${functioninteractionfolder}/poll.js`);
            let act = functionimp.newReaction(inputreaction.message,client);
        }
    }
})
// End of Events section

// This will return a logging channel if logging is enabled *and* there is a channel set up for it. 
// Else this will return null. 
function fetchLoggingChannel(guildid) {
    if ((logging_enabled[guildid] != false)&&(loggingchannel[guildid] != "0")) {
        var thechannel = client.channels.resolve(loggingchannel[guildid]);
        return thechannel;
    }
    else {
        return null;
    }
}

// This will return the Audit Log entry for a given event. 
async function fetchAuditLog(type,guild) {
    var newLocal = await guild.fetchAuditLogs({ limit: 1, type: type }).then((logs) => {
        return logs;
    })
    return newLocal.entries.first();
}

// Login function will read the token from Token.txt and try to login with it. 
function login() {
    var tokencode = fs.readFileSync("Token.txt").toString();
    console.log(`Logging in with token ${tokencode}.`);
    client.login(tokencode);
}
// Update Commands function will refresh the command list from functions 
// written in the functions folder. 
function updateFunctions() {
    var functions = [];
    var functionsinter = [];
    fs.readdir(functionfolder, (err, files) => {
        files.forEach(file => {
            var name = file.slice(0,-3);
            functions.push(name);
        })
        functionarray = functions;
        console.log(`Successfully updated functionarray to [${functionarray.join(", ")}]`);
    });
    fs.readdir(functioninteractionfolder, (err, files) => {
        files.forEach(file => {
            var name = file.slice(0,-3);
            functionsinter.push(name);
        })
        functionarrayinteraction = functionsinter;
        console.log(`Successfully updated functionarrayinteraction to [${functionarrayinteraction.join(", ")}]`);
    })
}
// Update Prefixes function 
function updateServerPrefixes() {
    fs.readdir(configfolder, (err, files) => {
        files.forEach(file => {
            var name = file.slice(0,-5);
            var prefix = JSON.parse(fs.readFileSync(`${configfolder}${file}`));
            serverprefix[name] = prefix.prefix;
        })
        console.log(`Successfully updated serverprefixes.`);
    });
}
// Update Server configurations
function updateServerConfiguration() {
    fs.readdir(configfolder, (err, files) => {
        if (err) { console.log(err) }
        files.forEach(file => {
            var name = file.slice(0,-5);
            var logging = JSON.parse(fs.readFileSync(`${configfolder}${file}`));
            loggingchannel[name] = logging.loggingchannel;
            logging_enabled[name] = logging.loggingenabled;
            //logging_channel[name] = logging.logging_channel;
            //logging_emoji[name] = logging.logging_emoji;
            //logging_kicks[name] = logging.logging_kicks;
            //logging_invites[name] = logging.logging_invites;
            //logging_messages[name] = logging.logging_messages;
            //logging_roles[name] = logging.logging_roles;
            logging_channel_create[name] = logging.logging_channel_create;
            logging_channel_delete[name] = logging.logging_channel_delete;
            logging_channel_pinsupdate[name] = logging.logging_channel_pinsupdate;
            logging_channel_update[name] = logging.logging_channel_update;
            logging_emoji_create[name] = logging.logging_emoji_create;
            logging_emoji_delete[name] = logging.logging_emoji_delete;
            logging_emoji_update[name] = logging.logging_emoji_update;
            logging_kicks_kicks[name] = logging.logging_kicks_kicks;
            logging_kicks_bans[name] = logging.logging_kicks_bans;
            logging_kicks_leave[name] = logging.logging_kicks_leave;
            logging_invites_join[name] = logging.logging_invites_join;
            logging_invites_create[name] = logging.logging_invites_create;
            logging_invites_delete[name] = logging.logging_invites_delete;
            logging_messages_update[name] = logging.logging_messages_update;
            logging_messages_delete[name] = logging.logging_messages_delete;
            logging_roles_create[name] = logging.logging_roles_create;
            logging_roles_update[name] = logging.logging_roles_update;
            logging_roles_delete[name] = logging.logging_roles_delete;
            logging_roles_updatemember[name] = logging.logging_roles_updatemember;
        })
        console.log(`Successfully updated server configurations.`);
    });
}

// Fetch messages after the id given in the function. 
function fetchMessages(channelid,lastmessageid) {
    console.log(`${channelid} - ${lastmessageid}`)
    client.channels.fetch(channelid).then(fetchedchannel => {
        if (lastmessageid != undefined) {
            fetchedchannel.messages.fetch({ limit: 100, after: lastmessageid }).then(messages => {
                if (messages.first() == undefined) {
                    channelchecking[channelid] = undefined;
                    channelchecking = JSON.parse(JSON.stringify(channelchecking ));
                    console.log(`Finished checking channel ${fetchedchannel.name}`);
                    threads.splice(threads.indexOf(channelid),1);
                    channelthreads++;
                }
                else {
                    var messagebulk = [];
                    messages.each(message => {
                        var messageobject = {
                            author: message.author.id,
                            messagetext: message.content,
                            id: message.id,
                            channel: message.channel.id,
                            timestamp: message.createdTimestamp
                        }
                        if (message.editedAt != undefined) {
                            messageobject.edited = true
                        } 
                        else {
                            messageobject.edited = false
                        }
                        messageforks[message.guild.id].send(`ADD ${JSON.stringify(messageobject)}`)
                        messagebulk.push(messageobject);
                        //if (messages[i].embeds != undefined) {
                        //    
                        //}
                    })
                    if (messagebulk[0] == undefined) {
                        console.log("This was undefined.")
                        console.log(messages)
                        console.log("...")
                        console.log(messages.first());
                    }
                    else {
                        messagefunctions.pushMessages(messagebulk);
                        //algorithmfunctions.addMessageArrayLookup(Array.from(messages.values()));
                        lastmessageids[channelid] = messages.first().id;
                        try {
                            messagefunctions.saveLastMessageKeys(lastmessageids);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    threads.splice(threads.indexOf(channelid),1);
                    channelthreads++;
                }
            })
        }
        else {
            fetchedchannel.messages.fetch({ limit: 100 }).then(messages => {
                if (messages.first() == undefined) {
                    channelchecking[channelid] = undefined;
                    channelchecking = JSON.parse(JSON.stringify(channelchecking ));
                    console.log(`Finished checking channel ${fetchedchannel.name}`);
                    threads.splice(threads.indexOf(channelid),1);
                    channelthreads++;
                }
                else {
                    var messagebulk = [];
                    messages.each(message => {
                        var messageobject = {
                            author: message.author.id,
                            messagetext: message.content,
                            id: message.id,
                            channel: message.channel.id,
                            timestamp: message.createdTimestamp
                        }
                        if (message.editedAt != undefined) {
                            messageobject.edited = true
                        } 
                        else {
                            messageobject.edited = false
                        }
                        messageforks[message.guild.id].send(`ADD ${JSON.stringify(messageobject)}`)
                        messagebulk.push(messageobject);
                        //if (messages[i].embeds != undefined) {
                        //    
                        //}
                    })
                    if (messagebulk[0] == undefined) {
                        console.log("This was undefined.")
                        console.log(messages)
                        console.log("...")
                        console.log(messages.first());
                    }
                    else {
                        messagefunctions.pushMessages(messagebulk);
                        //algorithmfunctions.addMessageArrayLookup(Array.from(messages.values()));
                        lastmessageids[channelid] = messages.first().id;
                        try {
                            messagefunctions.saveLastMessageKeys(lastmessageids);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    threads.splice(threads.indexOf(channelid),1);
                    channelthreads++;
                }
            })
        }
    })
}

function fetchBacklogMessages(channelid,lastmessageid) {
    return new Promise((resolve,reject) => {
        client.channels.fetch(channelid).then(fetchedchannel => {
            if (lastmessageid != undefined) {
                fetchedchannel.messages.fetch({ limit: 100, before: lastmessageid }).then(messages => {
                    if (messages.first() == undefined) {
                        channelchecking[channelid] = undefined;
                        channelchecking = JSON.parse(JSON.stringify(channelchecking ));
                        console.log(`Finished creating backlog for channel ${fetchedchannel.name}`);
                        resolve(null);
                    }
                    else {
                        var messagebulk = [];
                        messages.each(message => {
                            var messageobject = {
                                author: message.author.id,
                                messagetext: message.content,
                                id: message.id,
                                channel: message.channel.id,
                                timestamp: message.createdTimestamp
                            }
                            if (message.editedAt != undefined) {
                                messageobject.edited = true
                            } 
                            else {
                                messageobject.edited = false
                            }
                            messageforks[message.guild.id].send(`ADD ${JSON.stringify(messageobject)}`)
                            messagebulk.push(messageobject);
                            //if (messages[i].embeds != undefined) {
                            //    
                            //}
                        });
                        if (messagebulk[0] == undefined) {
                            console.log("This was undefined.")
                            console.log(messages)
                            console.log("...")
                            console.log(messages.first());
                            reject("There was an error with the message bulk.");
                        }
                        else {
                            messagefunctions.pushMessages(messagebulk);
                            var messagelast = messages.last();
                            resolve(messagelast.id);
                        }
                    }
                })
            }
            else {
                fetchedchannel.messages.fetch({ limit: 100 }).then(messages => {
                    if (messages.first() == undefined) {
                        channelchecking[channelid] = undefined;
                        channelchecking = JSON.parse(JSON.stringify(channelchecking ));
                        console.log(`Finished creating backlog for channel ${fetchedchannel.name}`);
                        resolve(null);
                    }
                    else {
                        var messagebulk = [];
                        messages.each(message => {
                            var messageobject = {
                                author: message.author.id,
                                messagetext: message.content,
                                id: message.id,
                                channel: message.channel.id,
                                timestamp: message.createdTimestamp
                            }
                            if (message.editedAt != undefined) {
                                messageobject.edited = true
                            } 
                            else {
                                messageobject.edited = false
                            }
                            messageforks[message.guild.id].send(`ADD ${JSON.stringify(messageobject)}`)
                            messagebulk.push(messageobject);
                            //if (messages[i].embeds != undefined) {
                            //    
                            //}
                        });
                        if (messagebulk[0] == undefined) {
                            console.log("This was undefined.")
                            console.log(messages)
                            console.log("...")
                            console.log(messages.first());
                            reject("There was an error with the message bulk.");
                        }
                        else {
                            messagefunctions.pushMessages(messagebulk);
                            var messagelast = messages.last();
                            var messagefirst = messages.first();
                            if (!backlogmessageids.hasOwnProperty(channelid)) {
                                backlogmessageids[channelid] = messagefirst.id;
                            }
                            if (backlogmessageids[channelid] < messagefirst.id) {
                                backlogmessageids[channelid] = messagefirst.id;
                            }
                            resolve(messagelast.id);
                        }
                    }
                })
            }
        })
    })
}

async function fetchBacklogSetup(channelid) {
    var done = false
    var backlogchannelid = undefined;
    var highestchannelid = '0';
    var channelname = '';
    client.channels.fetch(channelid).then(fetchedchannel => {
        channelname = fetchedchannel.name
    });
    var working = false;
    var backthreads = setInterval(async () => {
        console.log(`${channelname} - backlogchannelid: ${backlogchannelid} - done: ${done} - working: ${working}`)
        // This thread is currently doing nothing. 
        if ((done != true) && (working != true)) {
            fetchBacklogMessages(channelid,backlogchannelid).then((result) => {
                if (result == null) {
                    lastmessageids[channelid] = backlogmessageids[channelid];
                    backlogmessageids[channelid] = undefined;
                    backlogmessageids = JSON.parse(JSON.stringify(backlogmessageids));
                    try {
                        messagefunctions.saveLastMessageKeys(lastmessageids);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    done = true;
                }
                else {
                    backlogchannelid = result;
                }
                working = false;
            }).catch((err) => {
                console.log(err);
            })
        }
        // This thread is awaiting something in fetchBacklogMessages
        else if ((done != true) && (working == true)) {
            console.log("Waiting for "+channelid);
        }
        else {
            messagefunctions.createIndex(channelid);
            backlogmessageids[channelid] = undefined;
            backlogmessageids = JSON.parse(JSON.stringify(backlogmessageids));
            threads.splice(threads.indexOf(channelid),1);
            channelthreads++;
            clearInterval(backthreads);
        }
    }, 3500);
}

// Initial index creation handler
// This will check each server the bot is a part of. As long as every
// visible channel has a lastmessageid, OR there are no active checks
// for that server's channels, it will create an index if one doesn't exist
async function checkServerIndexes(force = false) {
    if (serversi >= servers.length) {
        serversi = 0;
    }
    var server = servers[serversi];
    console.log("Doing the thing for server "+server.name);
    if (server.available) {
        var backupchannelids = Object.keys(backlogmessageids);
        console.log(backupchannelids);
        var checkingchannelids = Object.keys(channelchecking);
        var channels = server.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
        var operatingchannelids = [];
        var failedindexing = false;
        var failedpath = false;
        channels.forEach((channel) => {
            if ((backupchannelids.indexOf(channel) != -1)) {
                // There are channels that are still being checked. Ignore this server for now. 
                failedindexing = true;
            }
        })
        if (fs.existsSync(`databaseindexes/${server.id}`)) {
            failedpath = true;
        }
        // We're running this regardless. This should be used on a weekly schedule.
        if (force) { 
            try {
                fs.rmdir(`databaseindexes/${server.id})`, { recursive: true },((err) => {
                    if (err) {
                        console.log(err);
                    }
                }));
            }
            catch (err) {
                console.log(err);
            }
            failedpath = false;
        }
        console.log(failedindexing);
        console.log(failedpath);
        // Run this is we have all channels known and there is no index. 
        // Unless we forced it above with it set to TRUE.
        try {
            if ((failedindexing != true)&&(failedpath != true)) {
                var channelkeys = server.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
                console.log(channelkeys);
                messagefunctions.getMessages(channelkeys).then(async (result) => {
                    var filteredmessages = result.filter(message => (message.messagetext != undefined && message.timestamp != undefined))
                    var arraylength = filteredmessages.length;
                    var messcount = 0;
                    console.log(arraylength);
                    var thisfork = messagefunctions.messageAddForkSetup(server.id)
                    thisfork.send(`CLR `); // Clear the read data, we want a fresh count. 
                    var tcom = false;
                    thisfork.on('message', (data) => {
                        if (data.slice(0,4) == "TREQ") {
                            console.log(data);
                            tcom = false;
                            thisfork.send(`TRES${JSON.stringify(createTimestampArray(server.id))}`)
                        }
                        else if (data.slice(0,4) == "TCOM") {
                            console.log(data);
                            tcom = true;
                            thisfork.send(`ADD ${JSON.stringify(filteredmessages[messcount])}`);
                            messcount++;
                        }
                        else if ((data.slice(0,4) == "NEXT")&&(arraylength > messcount)) {
                            thisfork.send(`ADD ${JSON.stringify(filteredmessages[messcount])}`);
                            messcount++;
                        }
                        else if ((data.slice(0,4) == "NEXT")&&(arraylength <= messcount)) {
                            console.log("NEXT END");
                            thisfork.send(`SAVE`);
                            thisfork.send(`TERM`);
                            console.log(`Processed ${arraylength} messages for ${server.name}.`);
                            setTimeout(() => {
                                thisfork.kill()
                            },5000);
                        }
                    })
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    serversi++;
}

// Message Checking Handler
// Each object we pass here will have the following properties:
// 
// Server - This is the ID of the server the message belongs to.
// Author - This is the ID of the user that sent this message. 
// Messagetext - This is the raw text of the message. 
// MessageID - This is the ID of the message
// Channel - This is the ID of the channel this message was sent in. 
// Edited - Boolean for if this message has been edited. 
// Timestamp - Integer for when this was sent. Lower is older. 
// (Embed) - Array with Picture, Video, Other
// 
// We should be checking for bot messages and discarding them when handling an upload
// to Firebase to reduce bandwidth. Pictures should be discarded. Embed Data is optional. 
// When there are messages, this will iterate as fast as possible, however when it is 
// inactive, we will use a 10 second timer to start up again. 
function checkMessages() {
    if (Object.keys(channelchecking).length != 0) {
        // Get the current keys for channelchecking. These are all values of true. 
        var channelkeys = Object.keys(channelchecking);
        channelkeys.forEach((key) => {
            try {
                // Limit ourselves to only the maximum number of requests in the channelthreads variable.
                // Only run the default fetchMessages if we've checked messages before. 
                if (((channelthreads > 0)&&(lastmessageids[key] != undefined))&&(!(threads.includes(key)))) {
                    channelchecking[key] = undefined;
                    channelchecking = JSON.parse(JSON.stringify(channelchecking));
                    channelthreads = (channelthreads-1);
                    threads.push(key);
                    fetchMessages(key,lastmessageids[key]);
                }
                // 
                else if ((channelthreads > 0)&&(!(threads.includes(key)))) {
                    channelchecking[key] = undefined;
                    channelchecking = JSON.parse(JSON.stringify(channelchecking));
                    console.log("Creating backlog for channel with key " + key);
                    channelthreads = (channelthreads-1);
                    threads.push(key);
                    fetchBacklogSetup(key);
                }
            }
            catch(err) {
                console.log(err)
            }
        })
        // Recheck in 3 seconds until the channel returns no messages. 
        messagechecktimer = setTimeout(() => {
            checkMessages();
        }, 3000)
    }
    else {
        // There are no threads to check right now. Recheck in 10 seconds. 
        messagechecktimer = setTimeout(() => {
            checkMessages();
        }, 10000)
    }
}

// Iterates over every channel and creates a timeout to add them to the checklist
// if they are not already on channelchecking's list. 
function setChannelChecks() {
    var channelkeys = Object.keys(newchecks);
    channelkeys.forEach(async (key) => {
        // Check if the channel key is on our channelchecking object. If it isn't, add it
        if (!channelchecking.hasOwnProperty(key)) {
            channelchecking[key] = true;
        }
    })
    newchecks = new Object();
}

// Same as function above, but it's for initiating. Every channel gets marked initially. 
function setInitChannelChecks() {
    var channelkeys = [];
    client.channels.cache.each((channel) => {
        // We only want to index text channels. 
        if (channel.type == 'text') {
            channelkeys.push(channel.id);
        }
    })
    channelkeys.forEach(async (key) => {
        // Check if the channel key is on our channelchecking object. If it isn't, add it
        if (!channelchecking.hasOwnProperty(key)) {
            // Stagger the addition slightly. 
            await sleep(Math.random()*60000);
            channelchecking[key] = true;
        }
    })
}

// Removes a server's channel IDs from the lastmessages variable. 
// This will allow us to create a backlog for that server's channels. 
function lastmessageidpurge(server) {
    var channelkeys = server.channels.cache.filter(channel => channel.type === 'text').map(channel => channel.id);
    channelkeys.forEach((key) => {
        lastmessageids[key] = undefined;
        lastmessageids = JSON.parse(JSON.stringify(lastmessageids));
        backlogmessageids[key] = undefined;
        backlogmessageids = JSON.parse(JSON.stringify(backlogmessageids));
        channelchecking[key] = true;
    })
    messagechecktimer = setTimeout(() => {
        checkMessages();
    }, 3000)
}

// Lists all guilds that the bot is in. 
function getGuilds(msg) {
    var guilds = client.guilds.cache;
    var msgreturn = `Current guilds that this bot is in:\n`
    guilds.each((guild) => {
        if (msgreturn.length > 1800) {
            msg.channel.send(msgreturn);
            msgreturn = '';
        }
        msgreturn = `${msgreturn}\n${guild.name} - ${guild.id}`
    })
    msg.channel.send(msgreturn);
}

// Creates Message Fork handlers. These can be called later. 
function createForkHandlers(guildidarray) {
    guildidarray.forEach((guildid) => {
        messageforks[guildid] = messagefunctions.messageAddForkSetup(guildid)
        messageforks[guildid].on('message', (message) => {
            if (message == "TREQ") {
                messageforks[guildid].send(`TRES${JSON.stringify(createTimestampArray(guildid))}`)
            }
        })
    })
}

// Saves each message fork handler. 
function saveForkHandlers(guildidarray) {
    var keys = Object.keys(messageforks);
    for (const key of keys) {
        messageforks[key].send('SAVE')
    }
}

// Creates Timestamp array object 
function createTimestampArray(guildid) {
    var returnobject = new Object();
    var guild = client.guilds.cache.find(guild => guild.id === guildid);
    var now = moment();
    var servertimestamp = moment(guild.createdTimestamp).startOf('hours');
    var serverarray = [servertimestamp.valueOf()];
    var hourdelta = now.diff(servertimestamp, "hours");
    var i = 1;
    for (i = 1; hourdelta > i; i++) {
        serverarray.push(0);
    }
    returnobject.servertimestamp = serverarray;
    var memberarray = new Object();
    guild.members.cache.each(member => {
        var membertimestamp = moment(member.joinedTimestamp).startOf('hours');
        var memberarraypart = [membertimestamp.valueOf()];
        var hourdelta = now.diff(membertimestamp, "hours");
        for (i = 1; hourdelta > i; i++) {
            memberarraypart.push(0);
        }
        memberarray[member.id] = memberarraypart
    })
    returnobject.membertimestamp = memberarray
    var channelarray = new Object();
    guild.channels.cache.each(channel => {
        var channeltimestamp = moment(channel.createdTimestamp).startOf('hours');
        var channelarraypart = [channeltimestamp.valueOf()];
        var hourdelta = now.diff(channeltimestamp, "hours");
        for (i = 1; hourdelta > i; i++) {
            channelarraypart.push(0);
        }
        channelarray[channel.id] = channelarraypart
    })
    returnobject.channeltimestamp = channelarray
    return returnobject;
}

// For setting up interactions - TESTING
function interactionSetup() {
    client.api.applications(client.user.id).commands.post({ 
    //client.api.applications(client.user.id).guilds('504377910484926475').commands.post({
        data: {
            name: "tarot",
            description: "Draws tarot cards at random",
            type: 2,
            options: [
                {
                    name: "single",
                    description: "Draws a single tarot card",
                    type: 1  // subcommand
                },
                {
                    name: "three",
                    description: "Draws three cards in Past, Present and Future order",
                    type: 1 // subcommand
                },
                {
                    name: "cross",
                    description: "Draws ten cards in a Celtic Cross form",
                    type: 1 // subcommand
                }
            ]
        }
    })
    client.api.applications(client.user.id).commands.post({ 
    //client.api.applications(client.user.id).guilds('504377910484926475').commands.post({
        data: {
            name: "horoscope",
            description: "Posts a horoscope",
            type: 2,
            options: [
                {
                    name: "yesterday",
                    description: "Shows the horoscope for yesterday",
                    type: 1,  // subcommand
                    options: [
                        {
                            name: "sign",
                            description: "The sign to search for",
                            type: 3, // 3 is type STRING
                            required: true
                        }
                    ]
                },
                {
                    name: "today",
                    description: "Shows the horoscope for today",
                    type: 1,  // subcommand
                    options: [
                        {
                            name: "sign",
                            description: "The sign to search for",
                            type: 3, // 3 is type STRING
                            required: true
                        }
                    ],
                    default: true
                },
                {
                    name: "tomorrow",
                    description: "Shows the horoscope for tomorrow",
                    type: 1,  // subcommand
                    options: [
                        {
                            name: "sign",
                            description: "The sign to search for",
                            type: 3, // 3 is type STRING
                            required: true
                        }
                    ]
                }
            ]
        }
    })
    client.api.applications(client.user.id).commands.post({ 
    //client.api.applications(client.user.id).guilds('504377910484926475').commands.post({
        data: {
            name: "profilepicture",
            description: "Posts the user's uploaded avatar",
            type: 2,
            options: [
                {
                    name: "user",
                    description: "Specify which user to grab",
                    type: 6,  // subcommand
                    required: false
                },
                {
                    name: "hidden",
                    description: "Type the name a hidden user to grab (works if not in channel)",
                    type: 3,  // subcommand
                    required: false
                }
            ]
        }
    })
    client.api.applications(client.user.id).commands.post({ 
    //client.api.applications(client.user.id).guilds('504377910484926475').commands.post({
        data: {
            name: "poll",
            description: "Posts a poll question with answers as reactions.",
            type: 2,
            options: [
                {
                    name: "question",
                    description: "The question to ask",
                    type: 3,  // string
                    required: true
                },
                {
                    name: "answer_1",
                    description: "First Answer",
                    type: 3,  // string
                    required: true
                },
                {
                    name: "answer_2",
                    description: "Second Answer",
                    type: 3,  // string
                    required: true
                },
                {
                    name: "answer_3",
                    description: "Third Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_4",
                    description: "Fourth Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_5",
                    description: "Fifth Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_6",
                    description: "Sixth Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_7",
                    description: "Seventh Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_8",
                    description: "Eighth Answer",
                    type: 3,  // string
                    required: false
                },
                {
                    name: "answer_9",
                    description: "Ninth Answer",
                    type: 3,  // string
                    required: false
                }
            ]
        }
    })
}

login();
updateServerPrefixes();