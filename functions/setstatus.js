// setstatus.js
//
// Function for Enraa to set status for Josephine. 

export default function(msg,client) {
    if (msg.content.toLowerCase().slice(1).search("setstatus") == 0 && msg.author.id == '125093095405518850') {
		// Only I can set this
		console.log("Doing the thing!");
		// Regex Expressions
		//const staticemojistart = RegExp("");
		//const animatedemojistart = RegExp("");
		//const emojinamereg = RegExp("");
		//const emojiidreg = RegExp("");
		const emojiRegexMatch = RegExp("(?:<.*:)((?:w|-)*)(?::.*>)/gm");

		// Determine the variables
		var messagestring = msg.content.slice(11); // Cut out the calling command
		var emojitest = messagestring.match(emojiRegexMatch);
		var emojitype = -1; // This should only be -1 for no emoji, 0 for static emoji, 1 for animated emoji
		var emojiid = 0;
		var emojiname = new String();

		// Determine if this is an animated emoji or not
		if (emojitest !== null) {
			emojiid = emojitest[0].slice(-19, -1);
			if (emojitest[0].slice(0, 2) == "<:") {
				emojiname = emojitest[0].slice(2, emojitest[0].search(emojiid) - 1); // Line start behind colon
				emojitype = 0;
			} else if (emojitest[0].slice(0, 3) == "<a:") {
				emojiname = emojitest[0].slice(3, emojitest[0].search(emojiid) - 1); // Line start behind colon
				emojitype = 1;
			}
		}

		// Set the user activity. If it does not contain an emoji, we'll just do a status without an emoji.
		if (emojitype == -1) {
			//client.user.setActivity(messagestring, {status: "online", game: {name: messagestring, type: 0}}).then(function (element) {
            var thetype = messagestring.toUpperCase().split(" ")[0];
            var thetypeend = '';
			if (thetype === "PLAYING") {
				messagestring = messagestring.slice(8);
				thetypeend = thetype;
			} else if (thetype === "STREAMING") {
				messagestring = messagestring.slice(10);
				thetypeend = thetype;
			} else if (thetype === "LISTENING") {
				messagestring = messagestring.slice(12);
				thetypeend = thetype;
			} else if (thetype === "WATCHING") {
				messagestring = messagestring.slice(9);
				thetypeend = thetype;
			} else {
				thetypeend = "PLAYING";
			}
			client.user.setActivity(messagestring, { type: thetypeend }).then(function (element) {
                console.log(element);
                console.log("Set status with no emoji. -> " + messagestring);
			});
        }
    }
}