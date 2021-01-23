// profilepicture.js
//
// This will get the person by name or tag and return a message with their avatar URL.

export default function(msg,client) {
    var teststring = msg.content.toLowerCase().split(" ");
    teststring.shift();
    if (teststring.length == 0) {
        msg.channel.send(msg.member.displayName + "\n" + msg.author.avatarURL); // This was called without any target, let's just escape it by replying with only the user.
        return;
    }
    teststring = teststring.join(" "); // This rejoins the string without the calling command. We can avoid using an if statement doing it this way. This finally mutates teststring into a string
    var userobject;
    var memberobject;
    var escape = 0; // Regular variable to make sure we only modify it once.
    if (teststring.startsWith("<@") && teststring.endsWith(">", 21)) {
        // This is a mentioned user!
        userobject = msg.mentions.members.first().user; // Set user and member object and escape to 1
        memberobject = msg.mentions.members.first();
        escape = 1;
    } else {
        var memberlist = msg.guild.members.cache; // Grab guild members list!
        memberlist.each((element) => {
            var teststringtemp = element.displayName.toLowerCase(); // We're testing all lowercase versus all lowercase. This should alleviate case sensitivity.
            if (escape == 0 && teststringtemp.includes(teststring)) {
                // We're only testing for includes.
                userobject = element.user;
                memberobject = element;
                escape = 1;
            }
        });
    }
    if (escape != 1) {
        // We found nobody
        msg.reply(
            "I could not find anybody by that name. Check your spelling or tag them."
        );
    } else {
        msg.channel.send(memberobject.displayName + "\n" + userobject.displayAvatarURL());
    }
}