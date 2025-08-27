import fs from 'fs'
const premiumFile = './json/premium.json'

// Aseguramos archivo
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]), 'utf-8')

// Función de verificación
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0] // extraemos el numérico del JID
    return data.includes(botId)
  } catch {
    return false
  }
}

const charactersFilePath = './database/characters.json';
const haremFilePath = './database/harem.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❌ No pudimos atrapar la información esta vez.\n> *Si crees que es un fallo, reportalo con los moderadores utilizando /report.*');
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

let handler = async (m, { conn, args }) => {
    if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
    }
    if (args.length === 0) {
        await conn.sendMessage(m.chat, { 
            text: '⚠️ Necesitamos un nombre para buscar la información.\n> *Ejemplo:* `#winfo Aika Sano`', 
            ...global.rcanal 
        }, { quoted: m });
        return;
    }

    const characterName = args.join(' ').toLowerCase().trim();

    try {
        const characters = await loadCharacters();
        const character = characters.find(c => c.name.toLowerCase() === characterName);

        if (!character) {
            await conn.sendMessage(m.chat, { 
                text: `✎ No pudimos atrapar la información esta vez.\n> *¿Seguro que existe "${characterName}"?*`, 
                ...global.rcanal 
            }, { quoted: m });
            return;
        }

        const harem = await loadHarem();
        const userEntry = harem.find(entry => entry.characterId === character.id);
        const statusMessage = userEntry
            ? `Reclamado por @${userEntry.userId.split('@')[0]}`
            : 'Libre';

        const message = `╭─────────────────
│ *INFO WAIFU*
├─────────────────
┃✎ *Nombre:* » *${character.name}*
┃✎ *Género:* » *${character.gender}*
┃✎ *Valor:* » *${character.value}*
┃✎ *Estado:* » ${statusMessage}
┃✎ *Fuente:* » *${character.source}*
╰─────────────────`;

        await conn.sendMessage(m.chat, { 
            text: message, 
            mentions: userEntry ? [userEntry.userId] : [], 
            ...global.rcanal 
        }, { quoted: m });
    } catch (error) {
        await conn.sendMessage(m.chat, { 
            text: `✎ No pudimos atrapar la información esta vez.`, 
            ...global.rcanal 
        }, { quoted: m });
    }
};

handler.help = ['winfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = false

export default handler;
