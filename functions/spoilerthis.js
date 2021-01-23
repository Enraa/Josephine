// spoilerthis.js
//
// Copy of the spoilerthis function, in case people want to call it with the flag. 

// This is a message with a photo that the user wants spoiler'd.
export default function(msg,client) {
    // Check if there's an attachment and if we can repost it
    if ((msg.attachments.length != 0)&&(msg.channel.permissionsFor(msg.guild.me).has(['SEND_MESSAGES','MANAGE_MESSAGES']))) {
        var attachments = [];
        msg.attachments.forEach((att) => {
            attachments.push({
                attachment: att.attachment,
                name: `SPOILER_${att.name}`
            })
        })
        msg.channel.send(`<@${msg.author.id}>: ${msg.content.slice(12)}`, { files: attachments })
        msg.delete();
    }
}