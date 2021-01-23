// profilepicture.js
//
// This will get the person by name or tag and return a message with their avatar URL.

export default function(interaction,args,client) {
    var person = '';
    console.log(interaction);
    if (args == undefined) {
        person = client.guilds.resolve(interaction.guild_id).members.resolve(interaction.member.user.id)
        client.api.interactions(interaction.id, interaction.token).callback.post({ // This was called without any target, let's just escape it by replying with only the user.
            data: {
                type: 4,
                data: {
                    content: `${person.displayName}\n${person.user.avatarURL()}`
                }
            }
        })
        return;
    }
    else if (args[0].name == 'user') {
        person = client.guilds.resolve(interaction.guild_id).members.resolve(args[0].value)
        client.api.interactions(interaction.id, interaction.token).callback.post({ // This was called without any target, let's just escape it by replying with only the user.
            data: {
                type: 4,
                data: {
                    content: `${person.displayName}\n${person.user.avatarURL()}`
                }
            }
        })
        return;
    }
    else {
        var escape = 0;
        var memberlist = client.guilds.resolve(interaction.guild_id).members.cache; // Grab guild members list!
        memberlist.each((element) => {
            var teststringtemp = element.displayName.toLowerCase(); // We're testing all lowercase versus all lowercase. This should alleviate case sensitivity.
            if (escape == 0 && teststringtemp.includes(args[0].value)) {
                // We're only testing for includes.
                person = element;
                escape = 1;
            }
        });
        if (escape != 1) {
            // We found nobody
            client.api.interactions(interaction.id, interaction.token).callback.post({ // This was called without any target, let's just escape it by replying with only the user.
                data: {
                    type: 4,
                    data: {
                        content: "I could not find anybody by that name. Check your spelling or tag them."
                    }
                }
            })
        }
        else {
            client.api.interactions(interaction.id, interaction.token).callback.post({ // This was called without any target, let's just escape it by replying with only the user.
                data: {
                    type: 4,
                    data: {
                        content: `${person.displayName}\n${person.user.avatarURL()}`
                    }
                }
            })
        }
        return;
    }
}