import fs from "fs"
import path from "path"

const autobioFile = path.resolve("./json/autobio.json")
const premiumFile = path.resolve("./json/premium.json")

// crear config si falta
if (!fs.existsSync(autobioFile)) {
  fs.writeFileSync(autobioFile, JSON.stringify({ enabled: false, intervalMinutes: 5 }, null, 2))
}

// guardamos loops por bot (subbots)
if (!global.__autobioLoops) global.__autobioLoops = {} // { jid: intervalId }

// --- utils ---
function readJSONSafe(p) {
  try {
    if (!fs.existsSync(p)) return null
    const raw = fs.readFileSync(p, "utf8")
    return JSON.parse(raw || "null")
  } catch (e) {
    return null
  }
}
function writeJSON(p, d) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2))
}
function normalizeNumber(s) {
  return String(s || "").replace(/[^0-9]/g, "")
}
function getRawBotJid(conn) {
  // intenta varias rutas habituales de Baileys
  return String(conn?.user?.jid || conn?.user?.id || conn?.user?.me?.id || "") || ""
}
function getBotNumber(conn) {
  const raw = getRawBotJid(conn)
  return normalizeNumber(raw.split("@")[0] || raw)
}
function isBotPremium(conn) {
  const list = readJSONSafe(premiumFile) || []
  if (!Array.isArray(list)) return false
  const normalized = list.map(x => normalizeNumber(x))
  const botNum = getBotNumber(conn)
  return normalized.includes(botNum)
}
function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":")
}

// --- loop control ---
async function startLoop(conn) {
  const jid = getRawBotJid(conn)
  if (!jid) return
  if (global.__autobioLoops[jid]) return // ya corriendo

  const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
  const intervalMs = Math.max(1, parseInt(cfg.intervalMinutes || 5)) * 60 * 1000

  const tick = async () => {
    try {
      const up = clockString(process.uptime() * 1000)
      const premium = isBotPremium(conn)
      const bio = `🤖 Tech-Bot V1 | ⏱️ ${up} | ${premium ? "🌟 Premium" : "🆓 Gratis"}`
      await conn.updateProfileStatus(bio).catch(() => {})
    } catch (e) {
      // no reventar el loop
      console.error("autobio tick error:", e?.message || e)
    }
  }

  // ejecuta ya y programa
  await tick()
  const id = setInterval(tick, intervalMs)
  global.__autobioLoops[jid] = id
}

function stopLoop(conn) {
  const jid = getRawBotJid(conn)
  const id = jid ? global.__autobioLoops[jid] : null
  if (id) {
    clearInterval(id)
    delete global.__autobioLoops[jid]
  }
}

// --- handler ---
let handler = async (m, { conn, args }) => {
  const opt = (args[0] || "").toLowerCase()

  if (opt === "on") {
    const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
    if (cfg.enabled) return m.reply("⚠️ El auto-bio ya está activado.")
    cfg.enabled = true
    writeJSON(autobioFile, cfg)
    await startLoop(conn)
    return m.reply("✅ Auto-bio activado.")
  }

  if (opt === "off") {
    const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
    if (!cfg.enabled) return m.reply("⚠️ El auto-bio ya está desactivado.")
    cfg.enabled = false
    writeJSON(autobioFile, cfg)
    stopLoop(conn)
    return m.reply("❌ Auto-bio desactivado.")
  }

  if (opt === "set") {
    const minutes = parseInt(args[1])
    if (isNaN(minutes) || minutes < 1) return m.reply("⏱️ Uso: *.autobio set <minutos>* (mínimo 1)")
    const cfg = readJSONSafe(autobioFile) || {}
    cfg.intervalMinutes = minutes
    writeJSON(autobioFile, cfg)
    // reinicia loop si estaba activo
    stopLoop(conn)
    if (cfg.enabled) await startLoop(conn)
    return m.reply(`✅ Intervalo cambiado a ${minutes} minutos.`)
  }

  if (opt === "status") {
    const botJid = getRawBotJid(conn)
    const botNum = getBotNumber(conn)
    const premiumList = readJSONSafe(premiumFile) || []
    const normalized = Array.isArray(premiumList) ? premiumList.map(x => normalizeNumber(x)) : []
    const premium = normalized.includes(botNum)
    return m.reply(
      `🔎 Auto-bio status\n• Bot JID: ${botJid}\n• Bot num: ${botNum}\n• IsPremium: ${premium ? "✅ sí" : "❌ no"}\n• premium.json: ${normalized.length} entrada(s)\n\nUsos:\n.autobio on / off / set <min> / status`
    )
  }

  return m.reply("📌 Uso: *.autobio on/off/set/status*")
}

handler.help = ["autobio on", "autobio off", "autobio set <min>", "autobio status"]
handler.tags = ["owner"]
handler.command = ["autobio"]
handler.rowner = true

// revive o para loop cuando llegan mensajes
handler.before = async (m, { conn }) => {
  const cfg = readJSONSafe(autobioFile) || { enabled: false }
  if (cfg.enabled) await startLoop(conn)
  else stopLoop(conn)
}

export default handler
