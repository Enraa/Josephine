// interactionfunctions.js
//
// Shorthand functions for interactions

// Imports
import { APIMessage, MessageAttachment } from 'discord.js' // Import the APIMessage object

export async function createAPIMessage(interaction,content,client,files = null) {
    var apiMessage = ''; 
    if (files !== null) {
        var attachment = new MessageAttachment(files[0].attachment,files[0].name)
        apiMessage = await APIMessage.create(client.channels.resolve(interaction.channel_id), content, { attachment })
            .resolveData()
            .resolveFiles();
    }
    else {
        apiMessage = await APIMessage.create(client.channels.resolve(interaction.channel_id), content)
            .resolveData()
            .resolveFiles();
    }

    return { ...apiMessage.data, files: apiMessage.files };
}