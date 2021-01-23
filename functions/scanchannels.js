// scanchannels.js
// DEPRECIATED
//
// This is a former function in Josephine 1.0. This is an alias that will call listlastmessages
// after informing the user of the new syntax. 

var listlastmessages = require('./listlastmessages.js');

export default function(msg,client) {
    msg.reply(`**scanchannels** has been depreciated and will be removed soon. Please use **listlastmessages** to get the last message history. Refer to the help command for a list of current functions.\n\nMessage scans are automatically handled now approximately every 15 minutes.`);
    let act = listlastmessages.default;
    act(msg,client);
}