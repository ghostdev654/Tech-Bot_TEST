import fs from 'fs'

const file = './json/subbots.json'
if (!fs.existsSync(file)) fs.writeFileSync(file, "{}")

let db = JSON.parse(fs.readFileSync(file))

// Número del bot primario (sin @s.whatsapp.net)
const PRIMARY_NUMBER = "5491164239825"

let handler = async (m, { args }) => {
  if (!m.isGroup) return m.reply("📌 Este comando solo funciona en grupos.")
  if (!args[0]) return m.reply("✅ Uso:\n• subbots on\n• subbots off")

  // Inicializamos la configuración del grupo si no existe
  if (!db[m.chat]) db[m.chat] = { enabled: false }

  const option = args[0].toLowerCase()
  if (option === 'on') {
    db[m.chat].enabled = true
    m.reply("✅ Subbots activado en este grupo.\n📌 Solo el bot primario responderá.")
  } else if (option === 'off') {
    db[m.chat].enabled = false
    m.reply("❌ Subbots desactivado en este grupo.\n📌 Todos los bots responderán.")
  } else {
    return m.reply("✅ Uso:\n• subbots on\n• subbots off")
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2))
}

handler.help = ["subbots on/off"]
handler.command = ['subbots']
handler.tags = ["owner"]
handler.group = true
handler.rowner= true

// Middleware: decide si el bot debe ignorar un mensaje
handler.before = async function (m, { conn }) {
  if (!m.isGroup) return
  if (db[m.chat]?.enabled) {
    let thisBot = conn.user.jid.split('@')[0]
    if (thisBot !== PRIMARY_NUMBER) return true // 🔪 ignora todo
  }
}
