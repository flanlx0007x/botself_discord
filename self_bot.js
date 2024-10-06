const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();
const fs = require('fs');
const server = require('./server.js')
const roomDataPath = './room.json';
server();
const gifs = [
    'https://media1.tenor.com/m/Qpa94KC4rmcAAAAd/anime-anime-gif.gif',
    'https://media1.tenor.com/m/iRkL6OMGhU4AAAAC/alarm.gif'
    
];
const messages = [
    'Python 70%',
    'Node.js 20%',
    'HTML/CSS 10%',
    'I miss Pinmook <3 ❤',
    'I love Pinmook so much <3 ❤',
    'I miss you 😞'
];
let currentIndex = 0;
const client = new Client();

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    
    setInterval(async () => {
        const now = new Date();
        const options = { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false };
        const timeInThailand = now.toLocaleTimeString('en-US', options); 

        const randomGif = gifs[Math.floor(Math.random() * gifs.length)]; 
        const currentMessage = messages[currentIndex]; 
        
        // Update the bot's presence with streaming activity
        await client.user.setActivity(`${currentMessage} ${timeInThailand}`, { 
            type: 'STREAMING', 
            url: "https://www.youtube.com/watch?v=pV2KIUxBzPE"  // Use the correct URL here
        });

        // Cycle through messages
        currentIndex = (currentIndex + 1) % messages.length;
    }, 3000); // Update every 3 seconds
});




function splitMessageByEntries(entries, chunkSize = 5) {
    const result = [];
    for (let i = 0; i < entries.length; i += chunkSize) {
        result.push(entries.slice(i, i + chunkSize)); 
    }
    return result;
}

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'DM' && message.author.id === '1284791338432331860') {
        if (message.content === '!check') {
            let roomData = {};
            if (fs.existsSync(roomDataPath)) {
                roomData = JSON.parse(fs.readFileSync(roomDataPath, 'utf8'));
            }

            if (!roomData['862571604751810602'] || roomData['862571604751810602'].length === 0) {
                return message.author.send("วันนี้เขายังไม่ได้เข้าห้องเสียงใด ๆ เลย!");
            }

            const entries = roomData['862571604751810602'];
            const chunks = splitMessageByEntries(entries);

            for (let i = 0; i < chunks.length; i++) {
                let responseMessage = `กลุ่มที่ ${i + 1} (ห้อง ${i * 5 + 1} ถึง ${Math.min((i + 1) * 5, entries.length)}):\n\n`;
                chunks[i].forEach(entry => {
                    responseMessage += `ดิสที่ไป: ${entry.guild}\n`;
                    responseMessage += `ห้องที่ไป: ${entry.channel}\n`;
                    responseMessage += `วัน/เดือน/ปี: ${new Date(entry.time).toLocaleDateString('th-TH')}\n`;
                    responseMessage += `เวลาที่ไป: ${new Date(entry.time).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' })}\n\n`;
                    responseMessage += '---------------------------------\n';
                });

                message.channel.sendTyping(); 
                await message.author.send(responseMessage); 

                await new Promise(resolve => setTimeout(resolve, 100));
            }

            
            fs.writeFileSync(roomDataPath, JSON.stringify({}, null, 2));
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (!newState.member || !newState.channel || newState.member.user.bot) return;

    const userId = newState.member.id;

    if (userId !== '862571604751810602') {
        return;
    }

    const guildName = newState.guild.name;
    const channelName = newState.channel.name;
    const now = new Date();
    const timeInThailand = now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });

    let roomData = {};
    if (fs.existsSync(roomDataPath)) {
        roomData = JSON.parse(fs.readFileSync(roomDataPath, 'utf8'));
    }

    if (!roomData[userId]) {
        roomData[userId] = [];
    }

    roomData[userId].push({
        guild: guildName,
        channel: channelName,
        time: timeInThailand
    });

    fs.writeFileSync(roomDataPath, JSON.stringify(roomData, null, 2));
});

client.login(process.env.Token);
