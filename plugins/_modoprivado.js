import fs from 'fs'

let file = './json/modoprivado.json'
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({
  enabled: false,
  allowed: []
}, null, 2))

let modoprivado = JSON.parse(fs.readFileSync(file))

function saveConfig() {
  fs.writeFileSync(file, JSON.stringify(modoprivado, null, 2))
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  if (!global.owner.includes(m.sender)) return

  if (command == 'modoprivado') {
    if (!args[0]) return m.reply(`✿ Uso:\n\n${usedPrefix}modoprivado on/off\n${usedPrefix}modoprivado add\n${usedPrefix}modoprivado del\n\n📌 Estado: ${modoprivado.enabled ? '✅ Activado' : '❌ Desactivado'}\nPermitidos:\n${modoprivado.allowed.map(v => '• ' + v).join('\n') || 'Nadie'}`)
    
    if (args[0] === 'on') {
      modoprivado.enabled = true
      saveConfig()
      return m.reply('🔒 Modo privado activado.')
    }
    if (args[0] === 'off') {
      modoprivado.enabled = false
      saveConfig()
      return m.reply('🔓 Modo privado desactivado.')
    }
    if (args[0] === 'add') {
      if (!modoprivado.allowed.includes(m.chat)) {
        modoprivado.allowed.push(m.chat)
        saveConfig()
        return m.reply(`✅ Este chat (${m.chat}) fue habilitado.`)
      }
      return m.reply('⚠️ Este chat ya estaba permitido.')
    }
    if (args[0] === 'del') {
      let pos = modoprivado.allowed.indexOf(m.chat)
      if (pos >= 0) {
        modoprivado.allowed.splice(pos, 1)
        saveConfig()
        return m.reply(`🗑️ Este chat (${m.chat}) fue eliminado.`)
      }
      return m.reply('⚠️ Este chat no estaba en la lista.')
    }
  }
}

// Aquí viene la magia: middleware en el mismo plugin
handler.before = async function (m, { isOwner }) {
  if (!modoprivado.enabled) return false
  if (isOwner) return false
  if (!modoprivado.allowed.includes(m.chat)) {
    return true // bloquea el mensaje
  }
  return false
}

handler.command = /^modoprivado$/i
export default handler
