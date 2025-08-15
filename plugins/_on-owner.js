import fs from 'fs'
import path from 'path'

const configPath = path.join('./json', 'antiprivado.json')

// Número específico del bot que podrá aplicar el antiprivado
// ⚠ IMPORTANTE: Tiene que estar en formato jid con @s.whatsapp.net
const botNumberAllowed = '5491164239825@s.whatsapp.net' // <-- Cambia este por el número real del bot

// Leer configuración
function readConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ antiprivado: false }, null, 2))
    }
    return JSON.parse(fs.readFileSync(configPath))
  } catch {
    return { antiprivado: false }
  }
}

// Guardar configuración
function writeConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2))
}

// === ON/OFF SOLO OWNER ===
const handler = async (m, { command, args }) => {
  let config = readConfig()
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on2'

  if (!['antiprivado'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on2 antiprivado* / *.off2 antiprivado*`)
  }

  config.antiprivado = enable
  writeConfig(config)

  return m.reply(`✅ Antiprivado ${enable ? 'activado' : 'desactivado'}.`)
}

handler.command = ['on2', 'off2']
handler.rowner = true
handler.tags = ['owner']
handler.help = ['on2 antiprivado', 'off2 antiprivado']

// === MIDDLEWARE ANTIPRIVADO ===
handler.before = async (m, { conn }) => {
  if (m.isGroup) return

  // Solo ejecuta si el bot es el número permitido
  if (conn.user?.jid !== botNumberAllowed) return

  let config = readConfig()
  if (config.antiprivado) {
    const ownerNumbers = global.owner.map(o =>
      (Array.isArray(o) ? o[0] : o).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    )

    if (!ownerNumbers.includes(m.sender)) {
      await conn.updateBlockStatus(m.sender, 'block')
      return true
    }
  }
}

export default handler
