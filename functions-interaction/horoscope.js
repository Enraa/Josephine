// horoscope.js
//
// Reads signs from supplied text and provides the horoscope. 

// Imports
const aztrojs = require('aztro-js');
const fs = require("fs");
const bigbackupfile = 'jsoncollections/colornames.json'
import { MessageEmbed } from 'discord.js';
import { createAPIMessage } from '../internalfunctions/interactionfunctions.js';

// Variables
const signsgroup = [
    { sign: 'aquarius', url: 'https://i.imgur.com/kqUAGUd.jpg'},
    { sign: 'aries', url: 'https://i.imgur.com/vxktHrA.jpg'},
    { sign: 'cancer', url: 'https://i.imgur.com/LsxeawA.jpg'},
    { sign: 'capricorn', url: 'https://i.imgur.com/9eNDvji.jpg'},
    { sign: 'gemini', url: 'https://i.imgur.com/tUuV22d.jpg'},
    { sign: 'leo', url: 'https://i.imgur.com/gyUFQNj.jpg'},
    { sign: 'libra', url: 'https://i.imgur.com/cBiZ6hs.jpg'},
    { sign: 'pisces', url: 'https://i.imgur.com/2o9rCpi.jpg'},
    { sign: 'sagittarius', url: 'https://i.imgur.com/DN00f65.jpg'},
    { sign: 'scorpio', url: 'https://i.imgur.com/RM22UG6.jpg'},
    { sign: 'taurus', url: 'https://i.imgur.com/pV7TCGs.jpg'},
    { sign: 'virgo', url: 'https://i.imgur.com/Omjfpz0.jpg'},
]

export default function(interaction,args,client) {
    var sign = 'null';
    var url = 'null';
    console.log(args[0].name);
    var day = args[0].name;
    signsgroup.forEach((signpair) => {
        if (args[0].options[0].value.toLowerCase().search(signpair.sign) != -1) {
            sign = signpair.sign;
            url = signpair.url;
        }
    })
    if (sign != "null") {
        aztrojs.getAllHoroscope(sign, async (res) => {
            var hororeply = res[day];
            var embed = new MessageEmbed;
            try {
                embed.setColor(colourNameToHex(hororeply.color))
            }
            catch (err) { console.log(err) }
            embed.setDescription(`*${hororeply.description}*\n\n**Compatibility:** ${hororeply.compatibility}\n**Mood:** ${hororeply.mood}\n**Color:** ${hororeply.color}\n**Lucky Number:** ${hororeply.lucky_number}\n**Lucky Time:** ${hororeply.lucky_time}`);
            embed.setAuthor(`${sign.slice(0,1).toUpperCase()}${sign.slice(1)} - ${hororeply.current_date}`);
            embed.setThumbnail(url);
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction,embed,client)
                }
            })
        })
    }
    else {
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: "Please include the name of the sign you want a horoscope for. Valid options are Aquarius, Aries, Cancer, Capricorn, Gemini, Leo, Libra, Pisces, Sagittarius, Scorpio, Taurus, Virgo"
                }
            }
        })
    }
}

// Helper function stolen from https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
// We can input a color name to get a hex code back. 
function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined') {
        return colours[colour.toLowerCase()];
    }
    else {
        return '#000000'; // For some reason, checking the big file causes it to fail - make it black for now. 
        // Check the big file as a fallback. 
        var bigjson = JSON.parse(fs.readFileSync(bigbackupfile))
        if (typeof bigjson[colour] != 'undefined') {
            return `#${bigjson[colour].hex}`;
        }
        else {
            return '#000000'; // We can't find anything, just make it black
        }
    }
}