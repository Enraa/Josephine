// convert.js
//
// This function will convert between c and f. 

// Imports
var utilityfunctions = require('../internalfunctions/utilityfunctions.js');


export default function(msg,client) {
    var fposition = msg.content
        .slice(8)
        .toLowerCase()
        .search("f");
    var cposition = msg.content
        .slice(8)
        .toLowerCase()
        .search("c");
    const regex = /\d+/;
    let m;
    var degrees = regex.exec(msg.content);
    if (degrees === null) {
        msg.reply(
            "Please specify an amount and/or a letter (F or C) to convert to or from. ```!convert 0C```"
        );
    } else {
        if (fposition != -1 && cposition != -1) {
            // An f and c exists in the request
            if (cposition > fposition) {
                // Cposition is after fposition, which means we are doing F to C
                var degreesnew = utilityfunctions.convertDegrees(degrees[0], "f");
                degreesnew = utilityfunctions.roundToOne(degreesnew);
                msg.channel.send(degrees[0] + "F is " + degreesnew + "C.");
            } else {
                // Fposition is after Cposition - we are doing C to F
                var degreesnew = utilityfunctions.convertDegrees(degrees[0], "c");
                degreesnew = utilityfunctions.roundToOne(degreesnew);
                msg.channel.send(degrees[0] + "C is " + degreesnew + "F.");
            }
        } else if (cposition == -1 && fposition == -1) {
            // We don't know how to convert this
            msg.reply(
                "Please specify an amount and/or a letter (F or C) to convert to or from. ```!convert 0C```"
            );
        } else if (cposition == -1 && fposition != -1) {
            // We are converting F to C
            var degreesnew = utilityfunctions.convertDegrees(degrees[0], "f");
            degreesnew = utilityfunctions.roundToOne(degreesnew);
            msg.channel.send(degrees[0] + "F is " + degreesnew + "C.");
        } else {
            // This should only ever evaluate if we are converting C to F
            var degreesnew = utilityfunctions.convertDegrees(degrees[0], "c");
            degreesnew = utilityfunctions.roundToOne(degreesnew);
            msg.channel.send(degrees[0] + "C is " + degreesnew + "F.");
        }
    }
}