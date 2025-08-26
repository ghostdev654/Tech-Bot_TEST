import fs from "fs"

const autobioFile = "./json/autobio.json"
const premiumFile = "./json/premium.json"

// Crear config inicial si no existe
if (!fs.existsSync(autobioFile)) {
  fs.writeFileSync(autobioFile, JSON.stringify({ enabled: false, intervalMinutes: 5 }, null, 2))
}

// Guardamos los loops por cada bot (en caso de subbots)
if (!global.__autobioLoops) global.__autobioLoops = {} // { jid: intervalId }

function getBotNumber(conn) {
  const jid = conn?.user?.id || conn?.user?.jid || ""
  return jid.split("@")[0].replace(/[^0-9]/g, "")
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":")
}

async function startLoop(conn) {
  const jid = conn?.user?.jid
  const num = getBotNumber(conn)
  const data = JSON.parse(fs.readFileSync(autobioFile))

  // Si ya hay loop para este bot, no lo dupliques
  if (global.__autobioLoops[jid]) return

  const intervalMs = (data.intervalMinutes || 5) * 60 * 1000

  const update = async () => {
    try {
      const uptime = process.uptime() * 1000
      const up = clockString(uptime)

      // 🔥 Leer lista de premium
      let premiumList = []
      if (fs.existsSync(premiumFile)) {
        try {
          premiumList = JSON.parse(fs.readFileSync(premiumFile))
        } catch {
          premiumList = []
        }
      }

      // Chequear si ESTE bot (su número) está en la lista
      const isPremium = Array.isArray(premiumList) && premiumList.includes(num)

      const bio = `🤖 Tech-Bot V1 | ⏱️ ${up} | ${isPremium ? "🌟 Premium" : "🆓 Gratis"}`
      await conn.updateProfileStatus(bio).catch(() => {})
    } catch (e) {
      console.error("Error actualizando bio:", e)
    }
  }

  await update()
  const id = setInterval(update, intervalMs)
  global.__autobioLoops[jid] = id
}

function stopLoop(conn) {
  const jid = conn?.user?.jid
  const id = global.__autobioLoops[jid]
  if (id) {
    clearInterval(id)
    delete global.__autobioLoops[jid]
  }
}

let handler = async (m, { conn, args }) => {
  let data = JSON.parse(fs.readFileSync(autobioFile))
  let option = (args[0] || "").toLowerCase()

  if (option === "on") {
    if (data.enabled) return m.reply("⚠️ El auto-bio ya está activado.")
    data.enabled = true
    fs.writeFileSync(autobioFile, JSON.stringify(data, null, 2))
    await startLoop(conn)
    return m.reply("✅ Auto-bio activado.")
  }

  if (option === "off") {
    if (!data.enabled) return m.reply("⚠️ El auto-bio ya está desactivado.")
    data.enabled = false
    fs.writeFileSync(autobioFile, JSON.stringify(data, null, 2))
    stopLoop(conn)
    return m.reply("❌ Auto-bio desactivado.")
  }

  if (option === "set") {
    const minutes = parseInt(args[1])
    if (isNaN(minutes) || minutes < 1) return m.reply("⏱️ Uso: *.autobio set <minutos>*")
    data.intervalMinutes = minutes
    fs.writeFileSync(autobioFile, JSON.stringify(data, null, 2))
    stopLoop(conn)
    if (data.enabled) await startLoop(conn)
    return m.reply(`✅ Intervalo cambiado a ${minutes} minutos.`)
  }

  m.reply("📌 Uso: *.autobio on/off/set*")
}

handler.help = ["autobio on", "autobio off", "autobio set <min>"]
handler.tags = ["owner"]
handler.command = ["autobio"]
handler.rowner = true

// Cada vez que el bot recibe mensaje, chequea si debe revivir loop
handler.before = async (m, { conn }) => {
  const data = JSON.parse(fs.readFileSync(autobioFile))
  if (data.enabled) {
    await startLoop(conn)
  } else {
    stopLoop(conn)
  }
}

export default handler
