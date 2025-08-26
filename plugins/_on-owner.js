import fs from 'fs'
import path from 'path'

const configPath = path.join('./json', 'antiprivado.json')

// Número específico del bot que podrá aplicar el antiprivado
// ⚠ IMPORTANTE: Formato correcto según tu WA (revisar si es @s.whatsapp.net o @c.us)
const botNumberAllowed = '5491164239825@s.whatsapp.net'

// Leer configuración
function readConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ antiprivado: false }, null, 2))
    }
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    console.error('Error leyendo config antiprivado:', e)
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

  if (type !== 'antiprivado') {
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
  if (m.isGroup) return false // solo privado

  // Normalizar jid del bot para evitar errores de @s.whatsapp.net vs @c.us
  const botJid = (conn.user?.jid || '').replace(/@c\.us$/, '@s.whatsapp.net')
  if (botJid !== botNumberAllowed) return false

  let config = readConfig()
  if (!config.antiprivado) return false

  // Normalizar ownerNumbers
  const ownerNumbers = global.owner?.map(o =>
    ((Array.isArray(o) ? o[0] : o).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
  ) || []

  if (!ownerNumbers.includes(m.sender)) {
    try {
      // updateBlockStatus usa true/false según la versión de Baileys
      await conn.updateBlockStatus(m.sender, true)
      console.log(`Bloqueado: ${m.sender}`)
    } catch (e) {
      console.error('Error bloqueando usuario:', e)
    }
    return true
  }

  return false
}

export default handler
