const charactersFilePath = './database/characters.json'
const haremFilePath = './database/harem.json'
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

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error('❌ No se pudo cargar el archivo *characters.json*.')
  }
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

let handler = async (m, { conn, command, args }) => {
  if (!args.length) {
    return conn.sendMessage(m.chat, {
      text: `
⚠️ Debes proporcionar el nombre de un personaje
> ✳️ *Ejemplo ›* ${command} Roxy Migurdia
`.trim()
    }, { quoted: m })
  }

  const characterName = args.join(' ').toLowerCase().trim()

  try {
    const characters = await loadCharacters()
    const character = characters.find(c => c.name.toLowerCase() === characterName)

    if (!character) {
      return conn.sendMessage(m.chat, {
        text: `
❌ No se encontró › *${characterName}*
> ❒ Verifica que el nombre esté correcto
`.trim()
      }, { quoted: m })
    }

    if (!character.vid || !character.vid.length) {
      return conn.sendMessage(m.chat, {
        text: `
❌ No hay videos registrados para › *${character.name}*
> ❒ Intenta con otro personaje
`.trim()
      }, { quoted: m })
    }

    const randomVideo = character.vid[Math.floor(Math.random() * character.vid.length)]
    const caption = `
✩ Nombre › *${character.name}*
✿ Género › *${character.gender}*
❒ Fuente › *${character.source}*
`.trim()

    const sendAsGif = Math.random() < 0.5
    await conn.sendMessage(m.chat, {
      video: { url: randomVideo },
      gifPlayback: sendAsGif,
      caption
    }, { quoted: m })

  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `
✘ Error al cargar el video › ${error.message}
> ❒ Intenta de nuevo más tarde
`.trim()
    }, { quoted: m })
  }
}

handler.help = ['wvideo']
handler.tags = ['gacha']
handler.command = ['charvideo', 'wvideo', 'waifuvideo']

export default handler
