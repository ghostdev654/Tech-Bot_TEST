import fs from 'fs'
const premiumFile = './json/premium.json'

// Aseguramos archivo
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]), 'utf-8')

// Función de verificación
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0] // extraemos el numérico del JID
    return data.includes(botId)
  } catch {
    return false
  }
}

// Ejemplo de uso dentro de un comando
let handler = async (m, { conn, text }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ Este bot no es premium. Contacta al owner para activarlo.')
  }

  // --- Lógica del comando si es premium ---
  m.reply('✅ Tienes acceso premium.')
}

handler.command = ['prem_']
export default handler
