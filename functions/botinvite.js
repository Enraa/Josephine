// botinvite.js
//
// Generates a bot invite link. This can only be called with me. 

export default function(msg,client) {
    if (msg.author.id == '125093095405518850') {
        client.generateInvite().then(link => msg.channel.send(link)).catch(err => console.log(err))
    }
} 