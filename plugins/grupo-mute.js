import fs from 'fs'
import path from 'path'

const mutePath = path.resolve('./json/mute.json')

// === Utils JSON ===
function readMute() {
  try {
    if (!fs.existsSync(mutePath)) {
      fs.mkdirSync(path.dirname(mutePath), { recursive: true })
      fs.writeFileSync(mutePath, JSON.stringify({}, null, 2))
    }
    const raw = fs.readFileSync(mutePath)
    return JSON.parse(raw.toString() || '{}')
  } catch {
    return {}
  }
}

function saveMute(data) {
  fs.writeFileSync(mutePath, JSON.stringify(data, null, 2))
}

function ensureChatConfig(botJid, chatId) {
  const db = readMute()
  if (!db[botJid]) db[botJid] = {}
  if (!db[botJid][chatId]) {
    // Por defecto: mute ON
    db[botJid][chatId] = { mute: true }
    saveMute(db)
  }
  return db
}

// === Comando: mute on/off ===
let handler = async (m, { conn, args, usedPrefix }) => {
  const botJid = conn?.user?.jid || 'bot'
  const db = ensureChatConfig(botJid, m.chat)
  const chatCfg = db[botJid][m.chat]

  const action = (args[0] || '').toLowerCase()
  if (!['on', 'off', 'estado', 'status', ''].includes(action)) {
    return m.reply(
      `Uso:\n${usedPrefix}mute on\n${usedPrefix}mute off\n${usedPrefix}mute (muestra estado)`
    )
  }

  if (action === 'on') {
    chatCfg.mute = true
    saveMute(db)
    return m.reply('🔇 Mute activado: el bot no responderá en este chat.')
  }

  if (action === 'off') {
    chatCfg.mute = false
    saveMute(db)
    return m.reply('🔊 Mute desactivado: el bot volverá a responder en este chat.')
  }

  // estado
  return m.reply(`Estado del chat: ${chatCfg.mute ? '🔇 Mute ON' : '🔊 Mute OFF'}`)
}

handler.command = /^mute$/i
handler.help = ['mute on', 'mute off', 'mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
export default handler

// === Middleware: bloquear respuestas si está mute ===
handler.before = async (m, { conn, command }) => {
  const botJid = conn?.user?.jid || 'bot'
  const db = ensureChatConfig(botJid, m.chat)
  const chatCfg = db[botJid][m.chat]

  // Permitir siempre el propio comando `mute` para poder desmutear
  if (command && /^mute$/i.test(command)) return

  // Si está mute → cortar todo
  if (chatCfg.mute) return true
}
