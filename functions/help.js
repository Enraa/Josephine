// help.js
// This function will return help messages 

import { MessageEmbed } from "discord.js";
var fs = require('fs');

export default function(msg) {
	var prefix = JSON.parse(fs.readFileSync(`./guildconfig/${msg.guild.id}.json`)).prefix;
    var newembed = new MessageEmbed()
		.setTitle("Commands for using Josephine - Prefix is "+prefix)
		.setColor(msg.guild.me.displayHexColor)
		.setThumbnail(msg.guild.me.user.avatarURL)
		.setTimestamp();
	newembed.addField(
		`${prefix}addemoji <link> <name>`,
		"***(Requires Manage Emojis permission)*** Attempts to add the image URL called in this command and create an emoji named <name>"
	);
	newembed.addField(
		`${prefix}convert <number>C **OR** ${prefix}convert <number>F`,
		"Converts temperatures between Celsius and Fahrenheit. ."
	);
	newembed.addField(
		`${prefix}list (>|<) (number) (type)`,
		"***(Mod Only)*** Lists users whose last message is greater than (>) or lesser than (<) the time given."
	);
	newembed.addField(
		`${prefix}roleadd | ${prefix}roleremove <role> <compare> <number> <type>`,
		"***(Mod Only)*** Attempts to add (or remove) a role that is tagged or matches the text in <role> to all users matching the condition.\n**<role>** can be a tagged role or typed\n**<compare>** can be '>' for greater than or '<' for less than\n**<number>** must be an integer\n**<type>** can be hours, days, weeks, or months. (h,d,w,m work too)"
	);
	newembed.addField(
		`${prefix}rolehas <role>`,
		"Lists all members which have every role listed. Separate each role by commas in plain text or tag the roles. Any number of roles can be used for this function. **rolehas tag** will instead tag each user it matches."
	);
	newembed.addField(
		`${prefix}listlastmessages`,
		"***(Mod Only)*** Lists the last messages sent by each user. "
	);
	newembed.addField(
		`${prefix}graph <tag> **OR** graph <rate> <tag>`,
		"***(Mod Only for non-self)*** Generates a graph of messages sent by a user or in a channel, or a 24 hour rate. Frequency is measured 0-100%."
	);
	newembed.addField(
		`${prefix}count <text>`,
		"Searches all messages for the exact text given (this can be a tag!) and then lists how many times each person has said it and how many times it was said in each channel."
	);
	newembed.addField(
		`${prefix}info <tag> **OR** info server`,
		"Generates an info card with common words, favorite channel and other information on the tagged user or channel. If there is no tag, it will default to yourself. "
	);
	newembed.addField(
		`${prefix}profilepicture <tag>`,
		"Gets the user's avatar picture. This command can except strings and will try to match the user's display name."
	);
	newembed.addField(
		`${prefix}joke`,
		"Tells an awful joke."
	);
	newembed.addField(
		`${prefix}pop <number>`,
		"Creates a grid of spoiler tagged lines similar to bubblewrap. Number can be any number between 1-14 for a square grid of that amount."
	);
	newembed.addField(
		`${prefix}tarot, ${prefix}tarot three, ${prefix}tarot cross`,
		"Pulls a card, three cards or a set of ten cards from a tarot card deck and writes their meaning."
	)
    msg.channel.send(newembed);
}