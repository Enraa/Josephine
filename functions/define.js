// define.js
//
// Reads the string and parses the first word and tries to define it using the English language. 

// Imports
var request = require("request");
var dictionaryurl = "https://api.dictionaryapi.dev/api/v2/entries/";


export default function (msg,client) {
    var word = 'jhkdl'
    var msglist = msg.content.toLowerCase().split(" ");
    if (2 > msglist.length) { // This does not include a word, so we should yell at them.
        msg.reply(`Please type a word to define. e.g **${msg.content.slice(0,7)} happy**`)
    }
    else {
        word = msglist[1]; // Set it to the first word we got - the rest will be discarded. 
    }
    request(
		{
			url: `${dictionaryurl}en/${word}`,
			json: true
		},
		function (error, response, body) {
			if (!error && response.statusCode === 200) {
                console.log(body);
                var wordc = body[0]
                var wordname = body[0].word
                var messagestring = `**${wordc.word}** - ${wordc.phonetics[0].text}`
                wordc.meanings.forEach((meaning) => {
                    messagestring = `${messagestring}\n__${meaning.partOfSpeech}__`
                    var index = 0;
                    meaning.definitions.forEach((def) => {
                        index++;
                        var synstring = '';
                        if (def.synonyms != undefined) {
                            def.synonyms.forEach((syn) => { 
                                synstring = `${synstring}, ${syn}`
                            });
                            synstring = synstring.slice(2);
                        }
                        if (synstring.length > 0) {
                            synstring = `\n**Synonyms:** ${synstring}`
                        }
                        var examplerep = ''
                        try {
                            examplerep = def.example.replace(wordname,`**${wordname}**`)
                        }
                        catch (err) {
                            console.log(err);
                        }
                        messagestring = `${messagestring}\n${index}. ${def.definition}\n"${examplerep}"${synstring}\n`
                    })
                })
                msg.channel.send(messagestring, { files: [wordc.phonetics[0].audio], split: true })
            }
            else {
                msg.channel.send(`Something went wrong while trying to search the word, **${word}**, or no definition exists.`)
            }
		}
	);
}