import fs from 'fs'
import path from 'path'

const restrictedPath = path.join('./json', 'restringidos.json')

// === UTILS ===
function readRestricted() {
  try {
    if (!fs.existsSync(restrictedPath)) {
      fs.writeFileSync(restrictedPath, JSON.stringify({ commands: [] }, null, 2))
    }
    return JSON.parse(fs.readFileSync(restrictedPath))
  } catch {
    return { commands: [] }
  }
}

function writeRestricted(data) {
  fs.writeFileSync(restrictedPath, JSON.stringify(data, null, 2))
}

// === COMANDO #re <nombre_comando> ===
const handler = async (m, { args }) => {
  if (!args[0]) return m.reply('✳️ Usa: #re <comando>')

  const cmd = args[0].toLowerCase()
  let restricted = readRestricted()

  if (restricted.commands.includes(cmd)) {
    restricted.commands = restricted.commands.filter(c => c !== cmd)
    writeRestricted(restricted)
    return m.reply(`✅ El comando *${cmd}* ya no está restringido.`)
  } else {
    restricted.commands.push(cmd)
    writeRestricted(restricted)
    return m.reply(`🚫 El comando *${cmd}* fue restringido.`)
  }
}

handler.command = ["re"]
handler.rowner = true
handler.tags = ['owner']
handler.help = ['re <comando>']

// === MIDDLEWARE RESTRICT ===
handler.before = async (m, { command }) => {
  let restricted = readRestricted()

  if (restricted.commands.includes(command)) {
    return !0 // corta ejecución → nadie puede usarlo
  }
}

export default handler
