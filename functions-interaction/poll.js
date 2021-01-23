// poll.js
//
// This will create a poll and serve it to the user with reactions. 

import { MessageEmbed } from 'discord.js'
import { createAPIMessage } from '../internalfunctions/interactionfunctions.js';

const reactions = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]

const sleep = milliseconds => {
	// Sleep function
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export default async function(interaction,args,client) {
    var answers = [];
    var embed = new MessageEmbed;
    var forquestion = false;
    var foranswer = false;
    var num = 0;
    args.forEach((arg) => { // Get all of the answers into an array. This should be proof against someone adding answers in an uncommon order. 
        if (arg.name.search('answer') == 0) {
            answers.push({
                name: `${reactions[num]} 0 votes`,
                value: arg.value
            })
            num++;
            forquestion = true;
        }
        if (arg.name.search('question') == 0) {
            embed.setTitle(arg.value);
            foranswer = true;
        }
    })
    if ((foranswer == false)||(forquestion == false)) { return }
    embed.addFields(answers)
        .setThumbnail(client.guilds.resolve(interaction.guild_id).members.resolve(interaction.member.user.id).user.avatarURL())
        .setFooter("/poll")
        .setTimestamp(Date.now());
    var channel = client.channels.resolve(interaction.channel_id)
    channel.send(embed).then((msg) => {
        answers.forEach(async (ans) => {
            await msg.react(ans.name.slice(0,3))
        })
    })
    return;
}

export async function newReaction(msg,client) {
    var embed = msg.embeds[0];
    var msgreactions = msg.reactions.cache;
    var reactionnums = new Object();
    var countvotes = 0;
    var promisearray = [];
    msgreactions.each((react) => {
        promisearray.push(new Promise((resolve,reject) => {
            react.users.fetch().then((usercol) => {
                console.log(react.emoji.name);
                if (reactions.includes(react.emoji.name)) {
                    console.log(react.count)
                    var nums = react.count;
                    if (usercol.has(client.user.id)) {
                        nums--;
                    }
                    reactionnums[react.emoji.name] = nums
                    countvotes = countvotes + nums;
                }
                resolve("Done");
            })
        }));
    })
    Promise.all(promisearray).then((res) => {
        embed.fields.forEach((field) => {
            if (reactionnums.hasOwnProperty(field.name.slice(0,3))) {
                console.log(field);
                if (countvotes > 0) { 
                    field.name = `${field.name.slice(0,3)} ${reactionnums[field.name.slice(0,3)]} votes (${(Math.round((reactionnums[field.name.slice(0,3)]/countvotes)*100))}%)`
                }
                else {
                    field.name = `${field.name.slice(0,3)} ${reactionnums[field.name.slice(0,3)]} votes`
                }
            }
        })
        console.log("Finish");
        msg.edit(embed);
    })
}