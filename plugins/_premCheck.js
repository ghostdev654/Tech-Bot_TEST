import fs from "fs"
import path from "path"

// Rutas
const premiumPath = path.join("./json", "premium.json")
const premiumCmdPath = path.join("./json", "premium_cmds.json")
const togglePath = path.join("./json", "premtoggle.json")

// Leer archivo helper
function readJson(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2))
      return defaultValue
    }
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return defaultValue
  }
}

// Guardar archivo helper
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// Chequear si el bot actual es premium
function isBotPremium(conn) {
  const premiumBots = readJson(premiumPath, [])
  let botJid = conn.user?.jid || conn.user?.id || ""
  let botNum = botJid.replace(/[^0-9]/g, "") // sacar el número
  return premiumBots.includes(botNum)
}

// Handler del comando .premfuncion
async function premFuncionHandler(m, { conn, args }) {
  const toggle = readJson(togglePath, { enabled: true })
  if (!args[0]) {
    return m.reply(`Estado actual: ${toggle.enabled ? "✅ ON" : "❌ OFF"}`)
  }

  if (args[0] === "on") {
    toggle.enabled = true
    writeJson(togglePath, toggle)
    return m.reply("✅ Funciones premium habilitadas")
  }
  if (args[0] === "off") {
    toggle.enabled = false
    writeJson(togglePath, toggle)
    return m.reply("❌ Funciones premium deshabilitadas")
  }

  return m.reply("Uso: .premfuncion on/off")
}

// Middleware para bloquear comandos premium
async function checkPremiumCommand(m, { conn, command }) {
  const toggle = readJson(togglePath, { enabled: true })
  const premiumCmds = readJson(premiumCmdPath, [])
  const isPremiumCmd = premiumCmds.includes(command)

  // Si no es comando premium, todo bien
  if (!isPremiumCmd) return true

  // Si el bot es premium, ignora el toggle y deja pasar
  if (isBotPremium(conn)) return true

  // Si toggle está apagado, bloquear
  if (!toggle.enabled) {
    await m.reply("⚠️ Este comando premium está deshabilitado por el owner.")
    return false
  }

  return true
}

// Exportar
export { premFuncionHandler, checkPremiumCommand }
