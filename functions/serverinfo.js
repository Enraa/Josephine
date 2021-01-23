// serverinfo.js
// DEPRECIATED
//
// This is a former function in Josephine 1.0.

export default function(msg,client) {
    msg.reply(`**serverinfo** has been depreciated and will be removed soon. Please use **info** to list information for the server. Refer to the help command for a list of current functions.\n\n**info server**`, { allowedMentions: { parse: [] } });
}