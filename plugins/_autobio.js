import fs from "fs"
import os from "os"

const file = "./json/autobio.json"

if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ enabled: false }))

let interval = null

let handler = async (m, { conn, args }) => {
  let data = JSON.parse(fs.readFileSync(file))
  let option = (args[0] || "").toLowerCase()

  if (option === "on") {
    if (data.enabled) return m.reply("⚠️ El auto-bio ya está activado.")
    data.enabled = true
    fs.writeFileSync(file, JSON.stringify(data, null, 2))

    // Inicia el loop de cambio automático
    interval = setInterval(async () => {
      try {
        let uptime = process.uptime() * 1000
        let up = clockString(uptime)

        // ⚡ Puedes cambiar esto para leer desde premium.json
        let premium = fs.existsSync("./json/premium.json")
          ? JSON.parse(fs.readFileSync("./json/premium.json"))
          : []
        let status = premium.length > 0 ? "🌟 Premium" : "🆓 Gratis"

        let bio = `𝙏𝙚𝙘𝙝-𝘽𝙤𝙩 🔹𝐕𝟏 | ⏱️ ${up}\nBy: 𝙸.𝚊𝚖 ᵍʰᵒˢᵗᵈᵉᵛ·ʲˢ OFC`
        await conn.updateProfileStatus(bio).catch(() => {})
      } catch (e) {
        console.error("Error actualizando bio:", e)
      }
    }, 1 * 60 * 1000) // cada 5 minutos

    m.reply("✅ Auto-bio activado.")
  } else if (option === "off") {
    if (!data.enabled) return m.reply("⚠️ El auto-bio ya está desactivado.")
    data.enabled = false
    fs.writeFileSync(file, JSON.stringify(data, null, 2))

    if (interval) {
      clearInterval(interval)
      interval = null
    }

    m.reply("❌ Auto-bio desactivado.")
  } else {
    m.reply("📌 Uso: *.autobio on/off*")
  }
}

handler.help = ["autobio on", "autobio off"]
handler.tags = ["owner"]
handler.command = ["autobio"]
handler.rowner = true // solo owner

export default handler

// Función para convertir ms → hh:mm:ss
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":")
}
