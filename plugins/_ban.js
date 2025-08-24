// comando ban/unban con middleware
import fs from 'fs'
let banFile = './json/banlist.json'

// Crear el archivo si no existe
if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, JSON.stringify([]))

let handler = async (m, { conn, args, command }) => {
  let banList = JSON.parse(fs.readFileSync(banFile))
  let user = m.mentionedJid[0] || args[0]

  if (!user) return m.reply('⚠️ Menciona a un usuario o pasa su número.')
  if (!user.endsWith('@s.whatsapp.net')) user = user.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  if (command === 'ban') {
    if (banList.includes(user)) return m.reply('❌ Ese usuario ya está baneado.')
    banList.push(user)
    fs.writeFileSync(banFile, JSON.stringify(banList, null, 2))
    m.reply(`✅ Usuario baneado: @${user.split('@')[0]}`, null, { mentions: [user] })
  }

  if (command === 'unban') {
    if (!banList.includes(user)) return m.reply('❌ Ese usuario no está baneado.')
    banList = banList.filter(u => u !== user)
    fs.writeFileSync(banFile, JSON.stringify(banList, null, 2))
    m.reply(`✅ Usuario desbaneado: @${user.split('@')[0]}`, null, { mentions: [user] })
  }
}

handler.help = ['ban @user', 'unban @user']
handler.tags = ['owner']
handler.command = ['ban', 'unban']
handler.rowner = true

// 🔹 Middleware que bloquea a los baneados
handler.before = async (m) => {
  let banList = JSON.parse(fs.readFileSync(banFile))
  if (banList.includes(m.sender)) {
    return !1 // ignora cualquier mensaje del baneado
  }
}

export default handler
