import fs from 'fs'
import fetch from 'node-fetch'

// Archivos de configuración
const PREMIUM_FILE = './json/premium.json'
const LIMITS_FILE = './json/limitsIg.json'

// Cargar premium.json
function loadPremium() {
  if (!fs.existsSync(PREMIUM_FILE)) return []
  return JSON.parse(fs.readFileSync(PREMIUM_FILE))
}

// Cargar limits.json
function loadLimits() {
  if (!fs.existsSync(LIMITS_FILE)) return {}
  return JSON.parse(fs.readFileSync(LIMITS_FILE))
}

// Guardar limits.json
function saveLimits(limits) {
  fs.writeFileSync(LIMITS_FILE, JSON.stringify(limits, null, 2))
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `❌ Debes proporcionar un enlace válido de Instagram.\n\n` +
      `Ejemplo:\n${usedPrefix + command} https://www.instagram.com/reel/abc123/`
    )
  }

  try {
    await m.react('⏳')

    // --- 📌 Sistema de límites/premium ---
    let botNumber = conn.user.id.split(':')[0].replace(/\D/g, '') // ID limpio del bot
    const premiumBots = loadPremium()
    const isPremium = premiumBots.includes(botNumber)

    if (!isPremium) {
      let limits = loadLimits()
      let now = Date.now()
      let resetAt = now + 5 * 60 * 60 * 1000 // 5 horas

      if (!limits[botNumber]) {
        limits[botNumber] = { count: 0, resetAt }
      }

      if (now >= limits[botNumber].resetAt) {
        limits[botNumber] = { count: 0, resetAt }
      }

      if (limits[botNumber].count >= 10) {
        let timeLeft = Math.max(0, limits[botNumber].resetAt - now)
        let minutes = Math.ceil(timeLeft / 60000)
        return m.reply(`⏳ Límite de descargas alcanzado. Vuelve a intentarlo en ${minutes} minutos.`)
      }

      limits[botNumber].count++
      saveLimits(limits)
    }

    // --- 📌 Descarga de Instagram ---
    const response = await fetch(`https://api.dorratz.com/igdl?url=${encodeURIComponent(text)}`)
    const json = await response.json()

    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      return m.reply('⚠️ No se encontraron archivos para descargar.')
    }

    for (const media of json.data) {
      const fileUrl = media.url
      const fileType = fileUrl.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'
      const thumbnailBuffer = media.thumbnail
        ? await (await fetch(media.thumbnail)).buffer()
        : null

      await conn.sendFile(
        m.chat,
        fileUrl,
        fileType === 'video/mp4' ? 'video.mp4' : 'imagen.jpg',
        `✅ Aquí tienes.`,
        m,
        false,
        {
          mimetype: fileType,
          thumbnail: thumbnailBuffer
        }
      )
    }

  } catch (error) {
    console.error('Error en descarga de Instagram:', error)
    m.reply('❌ Ocurrió un error al intentar descargar el contenido. Intenta nuevamente más tarde.')
  }
}

handler.help = ['ig <url>']
handler.tags = ['downloader']
handler.command = ['ig', 'instagram']

export default handler
