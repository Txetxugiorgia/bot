const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_REGION = process.env.AZURE_REGION;
const TRANSLATE_URL = `https://${AZURE_REGION}.api.cognitive.microsofttranslator.com/translate?api-version=3.0`;

const LANGUAGE_MAP = {
    'es': 'it', // De español a italiano
    'it': 'es'  // De italiano a español
};

const FLAG_MAP = {
    'es': '🇪🇸',
    'it': '🇮🇹'
};

async function translateText(text, fromLang) {
    const toLang = LANGUAGE_MAP[fromLang];
    if (!toLang) return null;
    
    try {
        const response = await axios.post(
            TRANSLATE_URL,
            [{ text }],
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': AZURE_KEY,
                    'Ocp-Apim-Subscription-Region': AZURE_REGION,
                    'Content-Type': 'application/json'
                },
                params: {
                    from: fromLang,
                    to: toLang
                }
            }
        );
        return response.data[0].translations[0].text;
    } catch (error) {
        console.error('Error translating:', error);
        return null;
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const detectedLang = /[\u0400-\u04FF]/.test(message.content) ? 'it' : 'es';
    const translatedText = await translateText(message.content, detectedLang);
    if (translatedText) {
        const flag = FLAG_MAP[LANGUAGE_MAP[detectedLang]];
        message.channel.send(`${flag} ${translatedText}`);
    }
});

client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
