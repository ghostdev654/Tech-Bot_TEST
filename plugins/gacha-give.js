
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
const charactersFilePath = './database/characters.json'
const haremFilePath = './database/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❌ No pudimos atrapar la información de personajes.')
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❌ No pudimos guardar los datos de characters.json.\n> ● *Intenta de nuevo más tarde.*')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2))
    } catch (error) {
        throw new Error('ꕥ No pudimos guardar los datos de harem.json.\n> ● *Intenta de nuevo más tarde.*')
    }
}

let handler = async (m, { conn, args }) => {
    if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
}
    const userId = m.sender

    if (args.length < 2) {
        await conn.sendMessage(m.chat, { 
            text: '⚠️ Debes especificar el nombre del personaje y mencionar a quién quieras regalarlo.\n> ● *Ejemplo ›* /regalar Aika Sano @usuario'
        }, { quoted: m })
        return
    }

    const characterName = args.slice(0, -1).join(' ').toLowerCase().trim()
    let who = m.mentionedJid[0]

    if (!who) {
        await conn.sendMessage(m.chat, { 
            text: '⚠️ Debes mencionar a un usuario válido.\n> ● *Ejemplo ›* /regalar Aika Sano @usuario'
        }, { quoted: m })
        return
    }

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName && c.user === userId)

        if (!character) {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ El personaje *${characterName}* no está reclamado por ti.\n> ● *Usa /harem para ver tu lista.*`
            }, { quoted: m })
            return
        }

        character.user = who
        await saveCharacters(characters)

        const harem = await loadHarem()
        const userEntryIndex = harem.findIndex(entry => entry.userId === who)

        if (userEntryIndex !== -1) {
            harem[userEntryIndex].characterId = character.id
            harem[userEntryIndex].lastClaimTime = Date.now()
        } else {
            harem.push({
                userId: who,
                characterId: character.id,
                lastClaimTime: Date.now()
            })
        }

        await saveHarem(harem)

        await conn.sendMessage(m.chat, { 
            text: `ꕥ *${character.name}* ahora pertenece a @${who.split('@')[0]}!\n> ● *¡Que disfrute su nuevo/a waifu!*`, 
            mentions: [who]
        }, { quoted: m })
    } catch (error) {
        await conn.sendMessage(m.chat, { 
            text: `❌ No se pudo completar la acción.\n> ● *Error ›* ${error.message}`
        }, { quoted: m })
    }
}

handler.help = ['regalar']
handler.tags = ['gacha']
handler.command = ['regalar', 'givewaifu', 'givechar']
handler.group = false

export default handler
