// memberinfo.js
// DEPRECIATED
//
// This is a former function in Josephine 1.0.

export default function(msg,client) {
    msg.reply(`**memberinfo** has been depreciated and will be removed soon. Please use **info** to list information for a member by tagging or naming it. Refer to the help command for a list of current functions.\n\n**info <@${msg.member.id}>**`, { allowedMentions: { parse: [] } });
}