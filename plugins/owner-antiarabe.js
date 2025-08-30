import fs from 'fs'


const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']

// Función para leer el JSON
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync('./settings.json'))
  } catch {
    return { antiarabepriv: false }
  }
}

// Función para guardar en el JSON
function saveSettings(data) {
  fs.writeFileSync('./json/settings2.json', JSON.stringify(data, null, 2))
}

const handler = async (m, { conn, args }) => {
  const settings = loadSettings()

  const option = (args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(option)) {
    return m.reply(`✳️ Usa:\n*.antiarabepriv on* / *.antiarabepriv off*`)
  }

  settings.antiarabepriv = option === 'on'
  saveSettings(settings)

  return m.reply(`✅ Antiarabe Priv ${option === 'on' ? 'activado' : 'desactivado'}.`)
}

handler.command = ['antiarabepriv']
handler.owner = true
handler.group = false
handler.private = false
handler.tags = ['owner']
handler.help = ['antiarabepriv on', 'antiarabepriv off']

// Antes de procesar cualquier mensaje privado
handler.before = async (m, { conn }) => {
  if (m.isGroup) return
  const settings = loadSettings()

  if (settings.antiarabepriv) {
    const jid = m.chat
    const number = jid.split('@')[0]
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab) {
      try {
        await conn.updateBlockStatus(jid, 'block')
        console.log(`🚫 Bloqueado número árabe en privado: ${jid}`)
      } catch (e) {
        console.log('❌ Error al bloquear:', e)
      }
      return true
    }
  }
}

export default handler
