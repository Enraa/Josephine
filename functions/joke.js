// joke.js
// This function is designed to query a server with jokes on it and return the result. 
// It is useful to determine if the bot is online. 

// Imports to ensure request works properly. 
var request = require("request");
var jokeurl = "https://official-joke-api.appspot.com/random_joke";

export default function(msg) {
    var jokeresponse = request(
		{
			url: jokeurl,
			json: true
		},
		function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log(body);
				msg.channel.send(body.setup + "\n||" + body.punchline + "||");
			}
		}
	);
}