// pop.js
//
// This will generate a pop grid of 1x1 to 14x14. 

export default function(msg,client) {
    var popline = "||pop||"
    var poplinecurr; // Start at 0 since we started with a line already
    var poplinemax = /\d+/g.exec(msg);
    if (poplinemax == null) { poplinemax = 5 } else { poplinemax = poplinemax[0] }
    var poptotal = '';
    if (poplinemax > 14) {
        poplinemax = 14;
    }
    var poplineeach = '';
    for (poplinecurr = 0; poplinecurr < poplinemax; poplinecurr++) {
        poplineeach = `${poplineeach}${popline}`
    }
    poplineeach = `${poplineeach}\n`
    for (poplinecurr = 0; poplinecurr < poplinemax; poplinecurr++) {
        poptotal = `${poptotal}${poplineeach}`
    }
    msg.channel.send(poptotal);
}