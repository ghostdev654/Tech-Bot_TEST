import fetch from 'node-fetch'
import fs from 'fs'

const usageFile = './json/limtsFb.json'

// Aseguramos archivo
if (!fs.existsSync(usageFile)) fs.writeFileSync(usageFile, JSON.stringify({}), 'utf-8')

// Limite
const LIMIT = 10
const COOLDOWN = 5 * 60 * 60 * 1000 // 5 horas en ms

// Función para verificar/actualizar usos
function checkLimit(user) {
  let data = JSON.parse(fs.readFileSync(usageFile))
  let now = Date.now()

  if (!data[user]) {
    data[user] = { count: 0, lastReset: now }
  }

  let entry = data[user]

  // Reset si pasaron más de 5hs
  if (now - entry.lastReset > COOLDOWN) {
    entry.count = 0
    entry.lastReset = now
  }

  if (entry.count >= LIMIT) {
    fs.writeFileSync(usageFile, JSON.stringify(data, null, 2))
    let restante = Math.ceil((COOLDOWN - (now - entry.lastReset)) / (60 * 1000))
    return { ok: false, restante }
  }

  entry.count++
  data[user] = entry
  fs.writeFileSync(usageFile, JSON.stringify(data, null, 2))

  return { ok: true }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = m.sender

  // Verificar límite
  let check = checkLimit(user)
  if (!check.ok) {
    return m.reply(`⚠️ Has alcanzado el límite de *${LIMIT} descargas*.\n\n⏳ Intenta nuevamente en *${check.restante} minutos*.`)
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
