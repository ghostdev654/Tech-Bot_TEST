import fs from 'fs'
import path from 'path'

const file = './json/primaryBots.json'
if (!fs.existsSync(file)) fs.writeFileSync(file, "{}")

let db = JSON.parse(fs.readFileSync(file))

function saveDB() {
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
}

let handler = async (m, { text }) => {
  // 📌 Obtiene el número: mención, respuesta o texto
  let number = 
    (m.mentionedJid && m.mentionedJid[0]?.replace('@s.whatsapp.net', '')) || 
    (m.quoted && m.quoted.sender ? m.quoted.sender.replace('@s.whatsapp.net', '') : null) ||
    (text ? text.replace(/[^0-9]/g, '') : null)

  if (!number) {
    return m.reply('⚠️ Debes mencionar, responder o escribir el número del bot que quieres poner como primario en este grupo.')
  }

  let botJid = number + '@s.whatsapp.net'

  // Inicializar grupo si no existe
  if (!db[m.chat]) db[m.chat] = {}

  db[m.chat].primaryBot = botJid
  saveDB()

  m.reply(`✅ El bot principal para este grupo ahora es:\n*${botJid}*`)
}

handler.help = ['setprimary @bot / número / responder']
handler.tags = ['serbot']
handler.command = ['setprimary']
handler.admin = true

export default handler
