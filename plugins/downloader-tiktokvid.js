import axios from 'axios'
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

const handler = async (m, { conn, args, usedPrefix, text, command }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
  }
  if (!text) return m.reply(`⏳ Ingresa una búsqueda para TikTok\n> *Ejemplo:* ${usedPrefix + command} haikyuu edit`)

  let res = await fetch(`https://apizell.web.id/download/tiktokplay?q=${encodeURIComponent(text)}`)
  let json = await res.json()

  if (!json.status || !json.data || !json.data.length) return m.reply('❌ No se encontró ningún video.')

  let vid = json.data[0]

  let caption = `📎 \`${vid.title}\`\n\n` +
                `👤 *Autor:* » ${vid.author}\n` +
                `👀 *Vistas:* » ${vid.views.toLocaleString()}\n` +
                `📎 *Link:* » ${vid.url}`

  await conn.sendMessage(m.chat, {
    video: { url: vid.url },
    caption
  }, { quoted: m })
}

handler.help = ['tiktokvid']
handler.tags = ['downloader']
handler.command = ['tiktokvid', 'playtiktok']
handler.register = true
export default handler
