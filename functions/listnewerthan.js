// listnewerthan.js
// DEPRECIATED
//
// This is a former function in Josephine 1.0. This is an alias that will call listusers
// after informing the user of the new syntax. 

var listusers = require('./listusers.js');

export default function(msg,client) {
    msg.reply(`**listnewerthan** has been depreciated and will be removed soon. Please use **listusers** to list users with <. Refer to the help command for a list of current functions.\n\n**listusers < 2 months**`);
}