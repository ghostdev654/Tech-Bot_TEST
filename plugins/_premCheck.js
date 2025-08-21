import fs from 'fs'
import path from 'path'

// Rutas de configuración
const togglePath = path.join('./json', 'premtoggle.json')
const premiumPath = path.join('./json', 'premium.json')
const cmdsPath = path.join('./json', 'premium_cmds.json')

// Leer configuración toggle
function readConfig() {
  try {
    if (!fs.existsSync(togglePath)) {
      fs.writeFileSync(togglePath, JSON.stringify({ enabled: true }, null, 2))
    }
    return JSON.parse(fs.readFileSync(togglePath))
  } catch {
    return { enabled: true }
  }
}

// Guardar configuración toggle
function writeConfig(data) {
  fs.writeFileSync(togglePath, JSON.stringify(data, null, 2))
}

// Verificar si el bot es premium
function isBotPremium(conn) {
  const premiumBots = fs.existsSync(premiumPath)
    ? JSON.parse(fs.readFileSync(premiumPath))
    : []
  let botJid = conn.user?.jid || conn.user?.id || ''
  let botNum = botJid.replace(/[^0-9]/g, '') // solo números
  return premiumBots.includes(botNum)
}

// === HANDLER PRINCIPAL ===
const handler = async (m, { command, args, conn }) => {
  let config = readConfig()
  const type = (args[0] || '').toLowerCase()

  if (!['premfuncion'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on3 premfuncion* / *.off3 premfuncion*`)
  }

  const enable = command === 'on3'
  config.enabled = enable
  writeConfig(config)

  return m.reply(`✅ Funciones premium ${enable ? 'activadas' : 'desactivadas'}.`)
}

handler.command = ['on3', 'off3']
handler.rowner = true
handler.tags = ['owner']
handler.help = ['on3 premfuncion', 'off3 premfuncion']

// === MIDDLEWARE PREMIUM ===
handler.before = async (m, { conn, command }) => {
  const config = readConfig()
  const premiumCmds = fs.existsSync(cmdsPath)
    ? JSON.parse(fs.readFileSync(cmdsPath))
    : []

  // Si el comando no está en la lista premium, no hacer nada
  if (!premiumCmds.includes(command)) return

  // Si el bot es premium → siempre deja usar
  if (isBotPremium(conn)) return

  // Si la función está desactivada → bloquear
  if (!config.enabled) {
    await m.reply('⚠️ Este comando premium está deshabilitado por el owner.')
    return true
  }
}

export default handler
