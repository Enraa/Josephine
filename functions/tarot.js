// tarot.js
//
// This will draw a tarot card using the api provided from https://github.com/howlCode/tarot_api

// Imports to ensure request works properly. 
var request = require("request");
var taroturl = "https://tarot.howlcode.com/api/v1";

// Discord MessageEmbed Object
import { MessageEmbed } from 'discord.js' // Import the MessageEmbed object

// Canvas
const { CanvasRenderingContext2D, createCanvas, Image, loadImage } = require('canvas');

var canvasw = 1750
var canvash = 2385
var canvasthreew = 1050
var canvasthreeh = 650

export default function(msg,client) {
    if ((msg.content.toLowerCase().search("tarot celtic") == 1)||(msg.content.toLowerCase().search("tarot cross") == 1)) {
        request(
            {
                url: `${taroturl}/spreads/celtic_cross`,
                json: true,
                agentOptions: {
                    rejectUnauthorized: false
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    console.log(body[0].name);
                    tarotcross(msg,body);
                }
                else {
                    msg.reply("there was an error with the tarot cards.")
                    console.log(error);
                    console.log(`Status Code: ${response.statusCode}`);
                }
            }
        );
    }
    else if ((msg.content.toLowerCase().search("tarot three") == 1)) {
        request(
            {
                url: `${taroturl}/spreads/three_cards`,
                json: true,
                agentOptions: {
                    rejectUnauthorized: false
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    console.log(body[0].name);
                    tarotthree(msg,body);
                }
                else {
                    msg.reply("there was an error with the tarot cards.")
                    console.log(error);
                    console.log(`Status Code: ${response.statusCode}`);
                }
            }
        );
    }
    else {
        request(
            {
                url: `${taroturl}/spreads/random_card`,
                json: true,
                agentOptions: {
                    rejectUnauthorized: false
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    console.log(body[0].name);
                    msg.channel.send(singleTarot(body[0]));
                }
                else {
                    msg.reply("there was an error with the tarot cards.")
                    console.log(error);
                    console.log(`Status Code: ${response.statusCode}`);
                }
            }
        );
    }
}

function cleanName(name) {
    var nameclean = '';
    var namecleanarray = name.split("-");
    namecleanarray.forEach((word) => {
        nameclean = `${nameclean}${word.slice(0,1).toUpperCase()}${word.slice(1)} `
    })
    return nameclean
}

function singleTarot(card) {
    var embed = new MessageEmbed;
    embed.setTitle(cleanName(card.name));
    embed.setDescription(card.summary);
    embed.setImage(card.image);
    embed.setTimestamp(Date.now());
    embed.addFields([
        { name: "Meaning", value: card.full_meaning },
        { name: "When upright, this can mean...", value: card.upright},
        { name: "When reversed, this may mean...", value: card.reversed}
    ])
    return embed;
}

function tarotthree(msg,cardarray) {
    var canvas = createCanvas(canvasthreew, canvasthreeh); // Each square is 8x8 + border
    var ctx = canvas.getContext('2d');
    var embed = new MessageEmbed;
    embed.setTitle(`Three Card Spread`);

    // Add the card meanings and their titles, in order. 
    embed.addFields([
        { name: `1. The Past - ${cleanName(cardarray[0].name)}`, value: cardarray[0].full_meaning },
        { name: `2. The Present - ${cleanName(cardarray[1].name)}`, value: cardarray[1].full_meaning },
        { name: `3. The Future - ${cleanName(cardarray[2].name)}`, value: cardarray[2].full_meaning },
    ])

    // Draw the background
    ctx.rect(0,0,canvasthreew,canvasthreeh);
    ctx.fillStyle = "#222222";
    ctx.fill();

    // Define Text Style
    ctx.font = "60px Sans";
    ctx.textAlign = "left";

    // Promises to place images
    var promisearray = [];
    promisearray.push(new Promise((resolve,reject) => {
        loadImage(cardarray[0].image).then((image) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(25-3, 80-3, 306, 536);
            ctx.drawImage(image, 25, 80, 300, 530)
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText("Past", 25, 80-10)
            resolve("Complete");
        })
    })) 
    promisearray.push(new Promise((resolve,reject) => {
        loadImage(cardarray[1].image).then((image) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(375-3, 80-3, 306, 536);
            ctx.drawImage(image, 375, 80, 300, 530)
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText("Present", 375, 80-10)
            resolve("Complete");
        })
    })) 
    promisearray.push(new Promise((resolve,reject) => {
        loadImage(cardarray[2].image).then((image) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(725-3, 80-3, 306, 536);
            ctx.drawImage(image, 725, 80, 300, 530)
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText("Future", 725, 80-10)
            resolve("Complete");
        })
    })) 
    Promise.all(promisearray).then((res) => {
        var datastring = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(datastring, 'base64');
        console.log(embed);
        msg.channel.send(embed).then((msg) => {
            msg.channel.send({ files: [{ 
                attachment: buffer,
                name: `threespread.jpg`
            }]})
        })
    });
}

function tarotcross(msg,cardarray) {
    var canvas = createCanvas(canvasw, canvash); // Each square is 8x8 + border
    var ctx = canvas.getContext('2d');
    var embed = new MessageEmbed;
    embed.setTitle(`Celtic Cross Spread`);

    // Add the card meanings and their titles, in order. 
    embed.addFields([
        { name: `1. The Present - ${cleanName(cardarray[0].name)}`, value: cardarray[0].full_meaning },
        { name: `2. Your Challenges - ${cleanName(cardarray[1].name)}`, value: cardarray[1].full_meaning },
        { name: `3. The Past - ${cleanName(cardarray[2].name)}`, value: cardarray[2].full_meaning },
        { name: `4. The Future - ${cleanName(cardarray[3].name)}`, value: cardarray[3].full_meaning },
        { name: `5. Your Aspirations - ${cleanName(cardarray[4].name)}`, value: cardarray[4].full_meaning },
        { name: `6. Your Underlying Feelings - ${cleanName(cardarray[5].name)}`, value: cardarray[5].full_meaning },
        { name: `7. Advice - ${cleanName(cardarray[6].name)}`, value: cardarray[6].full_meaning },
        { name: `8. External Influences - ${cleanName(cardarray[7].name)}`, value: cardarray[7].full_meaning },
        { name: `9. Your Hopes and/or Fears - ${cleanName(cardarray[8].name)}`, value: cardarray[8].full_meaning },
        { name: `10. Potential Outcome - ${cleanName(cardarray[9].name)}`, value: cardarray[9].full_meaning }
    ])

    // Draw the background
    ctx.rect(0,0,canvasw,canvash);
    ctx.fillStyle = "#222222";
    ctx.fill();

    // Define Text Style
    ctx.font = "60px Sans";
    ctx.textAlign = "left";

    // Iterate over this for each image, 
    // I wanted to use this imageplacearray with a for loop, however i would not access this properly. 
    var imageplacearray = [
        [450,928],[450,928],[75,928],[825,928],[450,323],[450,1533],[1200,1835],[1200,1230],[1200,625],[1200,20]
    ]
    var promisearray = [];
    promisearray.push(new Promise((resolve,reject) => {
        loadImage(cardarray[0].image).then((image) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(500-3, 928-3, 306, 536);
            ctx.drawImage(image, 500, 928, 300, 530)
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText("Present", 500, 928-10)
            resolve("Complete");
        })
    })) 
    // This is the second card - we're waiting for the first card to complete so we can draw the second card properly. 
    promisearray[0].then((res) => {
        promisearray.push(new Promise((resolve,reject) => {
            loadImage(cardarray[1].image).then((image) => {
                ctx.translate(650, 1280); // x,y of the center point of this card
                ctx.rotate(-1.3);
                ctx.fillStyle = "#000000";
                ctx.fillRect(-306/2, -536/2, 306, 536)
                ctx.drawImage(image, -300/2, -530/2, 300, 530)
                ctx.rotate(1.3);
                ctx.translate(-650, -1280);
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.fillText("Challenge", 650, 1280)
                ctx.textAlign = "left";
                resolve("Complete");
            })
        }))
        // Now we can draw the rest of the cards in order. 
        promisearray[1].then((res) => {
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[2].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(25-3, 928-3, 306, 536);
                    ctx.drawImage(image, 25, 928, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "left";
                    ctx.fillText("Past", 25, 928-10)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[3].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(975-3, 928-3, 306, 536);
                    ctx.drawImage(image, 975, 928, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "left";
                    ctx.fillText("Future", 975, 928-10)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[4].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(500-3, 283-3, 306, 536);
                    ctx.drawImage(image, 500, 283, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "left";
                    ctx.fillText("Goal", 500, 283-10)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[5].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(500-3, 1573-3, 306, 536);
                    ctx.drawImage(image, 500, 1573, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "left";
                    ctx.fillText("Subconscious", 500, 1573-10)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[6].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(1400-3, 1835-3, 306, 536);
                    ctx.drawImage(image, 1400, 1835, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "right";
                    ctx.fillText("Advice", 1380, 2235)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[7].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(1400-3, 1230-3, 306, 536);
                    ctx.drawImage(image, 1400, 1230, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "right";
                    ctx.fillText("External", 1380, 1630)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[8].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(1400-3, 625-3, 306, 536);
                    ctx.drawImage(image, 1400, 625, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "right";
                    ctx.fillText("Hopes/Fears", 1380, 775)
                    resolve("Complete");
                })
            }))
            promisearray.push(new Promise((resolve,reject) => {
                loadImage(cardarray[9].image).then((image) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(1400-3, 20-3, 306, 536);
                    ctx.drawImage(image, 1400, 20, 300, 530)
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "right";
                    ctx.fillText("Outcome", 1380, 170)
                    resolve("Complete");
                })
            }))
            Promise.all(promisearray).then((res) => {
                var datastring = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
                var buffer = new Buffer(datastring, 'base64');
                console.log(embed);
                msg.channel.send(embed).then((msg) => {
                    msg.channel.send({ files: [{ 
                        attachment: buffer,
                        name: `celticcross.jpg`
                    }]})
                })
            });
        })
    })
}