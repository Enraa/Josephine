// logging.js
// This is a module to handle posting logging updates. 

// Imports
import { MessageEmbed } from "discord.js";
const fs = require('fs');

// This will return an embed object with the parameters we supply. 
// Defaults will be used for any data that is not included. 
// Fields in order:
// Title: This is a good title for the embed
// Description: Main text section of the embed. Can have markdown 
// URL: This is the clickable URL for the title. If null, this will be a plain white embed. 
// Thumbnail: This is the thumbnail. We should use the relevant user when we can. 
// Color: This is the hex color of the embed. We should use the user's color when possible. 
// Fields: If this is not null, we will use these in pairs. (0,1), (2,3), (4,5), etc. 
//
// This will return an embed object we can then send with whatever function we're using. 
export function createEmbed(title = "Title",description = "Description",URL = null,thumbnail = null,color = null,fields = null) {
    var newembed = new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
    if (thumbnail != null) {
        newembed.setThumbnail(thumbnail)
    }
    if (color != null) {
        newembed.setColor(color);
    }
    if (URL != null) {
        newembed.setURL(URL);
    }
    if (fields != null) {
        var i;
        for (i = 0; i < fields.length; i = i + 2) {
            newembed.addField(fields[i],fields[i+1]);
        }
    }
    return newembed;
}

// This will create a default configuration if one does not exist for the server. 
export function defaultConfig(guild) {
    return new Promise ((resolve,reject) => {
        var jsonobject = {
            name: guild.name,
            prefix: "!",
            loggingchannel: 0,
            logging_enabled: false,
            logging_channel_create: true,
            logging_channel_delete: true,
            logging_channel_pinsupdate: true,
            logging_channel_update: true,
            logging_emoji_create: true,
            logging_emoji_delete: true,
            logging_emoji_update: true,
            logging_kicks_kicks: true,
            logging_kicks_bans: true,
            logging_kicks_leave: true,
            logging_invites_join: true,
            logging_invites_create: true,
            logging_invites_delete: true,
            logging_messages_update: true,
            logging_messages_delete: true,
            logging_roles_create: true,
            logging_roles_update: true,
            logging_roles_delete: true,
            logging_roles_updatemember: true
        }
        fs.writeFileSync(`guildconfig/${guild.id}.json`,JSON.stringify(jsonobject),(err) => {
            if (err) { console.log(err) }
            resolve("Done");
        })
    })
}