import fs from 'fs'
import path from 'path'

const globalSettingsPath = path.resolve('./json/globalsettings.json')
const premiumPath = path.resolve('./json/premium.json')

// === UTILS JSON ===
function readGlobalSettings() {
  try {
    if (!fs.existsSync(globalSettingsPath)) {
      fs.writeFileSync(globalSettingsPath, JSON.stringify({ premiumcheck: false }, null, 2))
    }
    return JSON.parse(fs.readFileSync(globalSettingsPath))
  } catch {
    return { premiumcheck: false }
  }
}

function saveGlobalSettings(data) {
  fs.writeFileSync(globalSettingsPath, JSON.stringify(data, null, 2))
}

function getPremiumUsers() {
  try {
    if (!fs.existsSync(premiumPath)) {
      fs.writeFileSync(premiumPath, JSON.stringify([], null, 2))
    }
    return JSON.parse(fs.readFileSync(premiumPath))
  } catch {
    return []
  }
}

// Comandos premium a bloquear si no es premium
const premiumCommands = ['cmd1', 'cmd2', 'cmd3'] // Agrega aquí los comandos que quieres restringir

// === COMANDO ON/OFF GLOBAL ===
const handler = async (m, { conn, command, args}) => {
 
  const type = (args[0] || '').toLowerCase()
  if (type !== 'premiumcheck') {
    return m.reply('Uso: .on premiumcheck | .off premiumcheck')
  }

  const enable = command === 'on'
  let globalSettings = readGlobalSettings()
  globalSettings.premiumcheck = enable
  saveGlobalSettings(globalSettings)

  return m.reply(`✅ Modo premiumcheck ${enable ? 'activado' : 'desactivado'} globalmente.`)
}

handler.command = ['on_', 'off_']
handler.owner = true
handler.help = ['on premiumcheck', 'off premiumcheck']
handler.rowner = true

// === MIDDLEWARE ===
handler.before = async (m, { conn }) => {
  if (m.fromMe) return // No bloquear mensajes del bot mismo

  const globalSettings = readGlobalSettings()
  if (!globalSettings.premiumcheck) return // Si no está activado, no hacer nada

  const botNumber = conn.user?.jid?.split('@')[0] || ''
  const premiumUsers = getPremiumUsers()
  const isPremiumBot = premiumUsers.includes(botNumber)

  if (!isPremiumBot) {
    const cmd = m.text.trim().split(' ')[0].slice(1).toLowerCase() // Asumiendo prefijo '.'
    if (premiumCommands.includes(cmd)) {
      await conn.reply(m.chat, '❌ Este comando requiere que el bot sea premium.', m)
      return true // Bloquear el comando
    }
  }
}

export default handler
