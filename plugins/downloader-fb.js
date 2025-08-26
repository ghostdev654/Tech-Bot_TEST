import fetch from 'node-fetch'
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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
  }
  if (!args[0]) return m.reply(
    `⚠️ Uso correcto:
${usedPrefix + command} <enlace válido de Facebook>

Ejemplo:
${usedPrefix + command} https://www.facebook.com/watch/?v=1234567890`
  )

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let api = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(args[0])}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json || !Array.isArray(json) || json.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('❌ No se encontró ningún video para ese enlace.')
    }

    let sentAny = false

    for (let item of json) {
      if (!item.url || !item.resolution) continue

      let caption = `
📹 *Facebook Video Downloader*

━━━━━━━━━━━━━━━
🔰 *Resolución:* ${item.resolution}
📁 *Archivo:* ${item.url.endsWith('.mp4') ? item.url.split('/').pop() : 'Descarga disponible'}
━━━━━━━━━━━━━━━
⏬ *Enlace original:* 
${args[0]}
      `.trim()

      try {
        await conn.sendMessage(m.chat, {
          video: { url: item.url },
          caption,
          fileName: `${item.resolution.replace(/\s/g, '_')}.mp4`,
          mimetype: 'video/mp4'
        }, { quoted: m })
        sentAny = true
      } catch {
        continue
      }
    }

    if (sentAny) {
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } else {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('❌ No se pudo enviar ningún video válido.')
    }

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ No se pudo obtener el video. Verifica el enlace e intenta nuevamente.')
  }
}

handler.command = ['facebook', 'fb', 'fbvideo']
handler.help = ['fb']
handler.tags = ['downloader']

export default handler
