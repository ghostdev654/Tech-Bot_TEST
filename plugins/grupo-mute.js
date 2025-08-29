import fs from "fs"

const FILE = "./json/mute.json"

// función para cargar
function loadMutes() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}, null, 2))
  return JSON.parse(fs.readFileSync(FILE))
}

// función para guardar
function saveMutes(db) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2))
}

let handler = async (m, { conn, command, text }) => {
  if (!m.isGroup) return m.reply("📌 Este comando solo funciona en grupos.")
  if (!text && !m.mentionedJid[0] && !m.quoted) return m.reply(`⚠️ Usa: .${command} @user / número / reply`)

  // cargar base
  let db = loadMutes()

  // obtener el ID del user
  let user = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
      ? m.quoted.sender 
      : text.replace(/[^0-9]/g, '') + "@s.whatsapp.net"

  if (!db[m.chat]) db[m.chat] = []

  if (command == "mute") {
    if (db[m.chat].includes(user)) 
      return m.reply(`⚠️ El usuario ya estaba muteado.`)

    db[m.chat].push(user)
    saveMutes(db)
    m.reply(`🔇 Usuario @${user.split('@')[0]} muteado.`, null, { mentions: [user] })
  } 

  if (command == "unmute") {
    if (!db[m.chat].includes(user)) 
      return m.reply(`⚠️ El usuario no estaba muteado.`)

    db[m.chat] = db[m.chat].filter(u => u !== user)
    saveMutes(db)
    m.reply(`🔊 Usuario @${user.split('@')[0]} desmuteado.`, null, { mentions: [user] })
  }
}

handler.help = ["mute", "unmute"]
handler.tags = ["group"]
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

// middleware dentro del mismo plugin pero ahora leyendo JSON
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  let db = loadMutes()
  if (!db[m.chat]) return
  if (db[m.chat].includes(m.sender)) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          fromMe: m.key.fromMe,
          participant: m.key.participant
        }
      })
    } catch (e) {
      console.log("❌ No pude borrar mensaje muteado:", e)
    }
  }
}

export default handler
