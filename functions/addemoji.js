// addemoji.js
//
// This command will take an image file and attempt to upload it. 

async function addEmoji(url,name,callback) {
	var guild = callback.channel.guild;
	console.log(guild)
	if (!guild.me.hasPermission(["MANAGE_EMOJIS"])) {
		return callback.channel.send(
			"I am missing permissions to manage emojis on this server."
		); // Check that the bot has Admin or Manage Emoji permissions
	}
	else {
		try {
			console.log(url);
			console.log(name);
			if (name == null) {
				return callback.channel.send(
					"Please provide a name for the emoji."
				); // Leave if we didn't get a name
			}
			// await guild.emojis.create(url,name).then(emoji => {
			await guild.emojis.create(url,name).then(emoji => {
				callback.channel.send(`Created new emoji named **${emoji.name}**. ${emoji}`)
			}).catch(err => {
				console.log(err);
			})
		}
		catch (err) {
            callback.channel.send("Something went wrong while trying to upload this emoji. The image may be too big or there are not enough slots in the server.");
			console.log(err);
		}
	}
}

export default function (msg,client) {
    if (!(msg.member.hasPermission('MANAGE_EMOJIS'))) { 
        msg.channel.send("You do not have permissions to manage emoji on this server.");
        return;
    }
    // Add emojis from a URL if the sender has emoji manage permissions
    var urlshort = msg.content.match(/http\S+\.[a-zA-Z]{3}/i);
	var url = msg.content.match(/http\S+\s/i);
	if (url == null) { msg.channel.send("Something went wrong with trying to add an emoji from that url."); return }
    var name = msg.content.replace(url[0],"").replace("!addemoji","").replace(" ","");
    console.log(url[0]);
    if (urlshort[0] != null && name != msg.content) {
		addEmoji(urlshort[0],name,msg);
    }
    else {
		msg.channel.send("Something went wrong with trying to add an emoji from that url.");
		return;
    }
}