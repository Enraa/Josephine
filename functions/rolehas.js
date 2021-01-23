// rolehas.js
//
// This will take the user's text input and attempt to resolve any roles provided. 

// Imports


export default function(msg,client) {
    // Remove the calling function, !rolehas. This will slice all the way up to and including the first " "
    var messageslice = msg.content.slice(/\S+ /.exec(msg.content)[0].length);
    var roles = [];
    if (msg.mentions.roles.first() != undefined) {
        // A role was tagged, let's just add it straight to the list. 
        msg.mentions.roles.each((role) => {
            roles.push(role)
        })
    }
    var messageslicearray = messageslice.split(",") // This will split our entries into an array separated by commas. 
    var guildrolelist = msg.guild.roles.cache.map(role => role.name);
    messageslicearray.forEach((slice) => {
        let reg = RegExp(slice.toLowerCase());
        var i = 0;
        while (guildrolelist.length > i) {
            if (reg.test(guildrolelist[i].toLowerCase())) { 
                roles.push(msg.guild.roles.cache.find(role => role.name == guildrolelist[i]))
                i = 9000;
            }
            i++;
        }
    })

    // If we have at least one role to test each of our users against, let's evaluate it. 
    if (roles.length == 0) {
        msg.channel.send("Please include a role's name or tag it.");
        return;
    }
    else {
        var members = msg.guild.members.cache;
        roles.forEach((role) => {
            members = members.filter(member => member.roles.cache.has(role.id))
        })
        var starttext = `Members with the following roles: `
        roles.forEach((role) => {
            starttext = `${starttext} ${role},`
        })
        // Remove the ending comma and then add linebreaks. 
        starttext = `${starttext.slice(0,-1)}\n\n`
        members.forEach((member) => {
            if (starttext.length > 1900) {
                starttext = `${starttext.slice(0,-2)}`
                msg.channel.send(starttext, { allowedMentions: { parse: [] } })
                starttext = '';
            }
            starttext = `${starttext}<@${member.id}>, `
        })
        starttext = `${starttext.slice(0,-2)}`
        msg.channel.send(starttext, { allowedMentions: { parse: [] } })
    }
}