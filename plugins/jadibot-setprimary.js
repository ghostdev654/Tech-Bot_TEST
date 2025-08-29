import fs from 'fs'

const file = './json/primaryBots.json'

// 🔹 Asegura que el JSON exista
if (!fs.existsSync(file)) fs.writeFileSync(file, '{}')
let db = JSON.parse(fs.readFileSync(file))

function saveDB() {
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
}

let handler = async (m, { text }) => {
  let number = null

  // 📌 Si se mencionó a alguien
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    number = m.mentionedJid[0].replace(/@s\.whatsapp\.net/, '')
  }

  // 📌 Si respondió un mensaje
  else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.replace(/@s\.whatsapp\.net/, '')
  }

  // 📌 Si puso un número por texto
  else if (text) {
    number = text.replace(/[^0-9]/g, '')
  }

  if (!number) {
    return m.reply('⚠️ Debes mencionar, responder o escribir el número del bot que quieres poner como primario en este grupo.')
  }

  let botJid = number + '@s.whatsapp.net'

  // 🔹 Guardar en el JSON
  if (!db[m.chat]) db[m.chat] = {}
  db[m.chat].primaryBot = botJid
  saveDB()

  return m.reply(`✅ El bot principal para este grupo ahora es:\n*${botJid}*`)
}

handler.help = ['setprimary @bot | responder | número']
handler.tags = ['serbot']
handler.command = ['setprimary']
handler.admin = true

export default handler
