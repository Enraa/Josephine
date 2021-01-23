// serverjoin.js
// This function will handle creating a JSON config with all of the default settings for Josephine in that server
// It will expect a guild argument to set the ID properly. 

// Imports
const fs = require("fs");

// Variables
const configfolder = './guildconfig/';
const defaultprefix = "!";

export function joinedServer(guild) {
    fs.readdir(configfolder, (err, files) => {
        console.log(`${files} is the thing.`);
        if (!files.contains(`${guild.id}.json`)) {
            var configuration = {
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
            console.log("Write new file");
            fs.writeFile(`${configfolder}${guild.id}.json`, JSON.stringify(configuration));
        }
        else {
            console.log("File exists?")
        }
    });
}