import { promises as fs } from 'fs';
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
const cooldowns = {};

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

async function saveCharacters(data) {
  await fs.writeFile(charactersFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveHarem(data) {
  await fs.writeFile(haremFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

let handler = async (m, { conn }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
      }
  const userId = m.sender;
  const now = Date.now();

  if (cooldowns[userId] && now < cooldowns[userId]) {
    const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000);
    const min = Math.floor(remainingTime / 60);
    const sec = remainingTime % 60;
    return await conn.reply(m.chat, `> 《✧》Debes esperar *${min} minutos y ${sec} segundos* para volver a utilizar *#c*`, m);
  }

  if (!m.quoted || m.quoted.sender !== conn.user.jid) {
    return await conn.reply(m.chat, '⚠️ Cita un personaje válido enviado por el bot.', m);
  }

  // Extraer ID desde el mensaje citado
  const characterIdMatch = m.quoted.text.match(/ID:\s?\*(.+?)\*/);
  if (!characterIdMatch) {
    return await conn.reply(m.chat, '❌ No se encontró un ID válido en el mensaje citado.', m);
  }

  const characterId = characterIdMatch[1];

  try {
    const characters = await loadCharacters();
    const harem = await loadHarem();

    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return await conn.reply(m.chat, '❌ El personaje con ese ID no existe.', m);
    }

    if (character.user && character.user !== userId) {
      return await conn.reply(
        m.chat,
        `> ⚠️ El personaje ya fue reclamado por @${character.user.split('@')[0]}`,
        m,
        { mentions: [character.user] }
      );
    }

    // Reclamación
    character.user = userId;
    character.status = 'Reclamado';

    // Guardar en harem.json
    if (!harem[userId]) harem[userId] = [];
    if (!harem[userId].some(p => p.id === character.id)) {
      harem[userId].push(character);
    }

    // Guardar cambios
    await saveCharacters(characters);
    await saveHarem(harem);

    cooldowns[userId] = now + 30 * 60 * 1000;

    await conn.reply(m.chat, `✅ Has reclamado a *${character.name}* con éxito :)`, m);

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Error al reclamar: ${err.message}`, m);
  }
};

handler.help = ['c'];
handler.tags = ['gacha'];
handler.command = ['c', 'claim', 'reclamar'];
handler.group = false;
export default handler;
