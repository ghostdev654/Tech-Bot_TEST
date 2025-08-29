import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

const premiumFile = './json/premium.json'
const limitsFile = './json/limits.json'

// asegurar archivos
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]))
if (!fs.existsSync(limitsFile)) fs.writeFileSync(limitsFile, JSON.stringify({}))

// verifica si el bot es premium
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0]?.replace(/\D/g, '')
    return data.includes(botId)
  } catch {
    return false
  }
}

// controla límites
function checkLimit(conn) {
  const botId = conn?.user?.id?.split(':')[0]?.replace(/\D/g, '')
  if (!botId) return { allowed: false, remaining: 0 }

  let limits = JSON.parse(fs.readFileSync(limitsFile, 'utf-8'))
  let now = Date.now()

  if (!limits[botId]) {
    limits[botId] = { count: 0, resetAt: now + 5 * 60 * 60 * 1000 } // 5h
  }

  // reset si pasó el tiempo
  if (now > limits[botId].resetAt) {
    limits[botId] = { count: 0, resetAt: now + 5 * 60 * 60 * 1000 }
  }

  // si aún tiene límite
  if (limits[botId].count < 10) {
    limits[botId].count++
    fs.writeFileSync(limitsFile, JSON.stringify(limits, null, 2))
    return { allowed: true, remaining: 10 - limits[botId].count, resetAt: limits[botId].resetAt }
  } else {
    return { allowed: false, remaining: 0, resetAt: limits[botId].resetAt }
  }
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`✳️ *Uso correcto:*\n${usedPrefix + command} <enlace o nombre>`)

  try {
    await m.react('⏳')

    // 🔑 check premium
    let premium = isBotPremium(conn)
    if (!premium) {
      let check = checkLimit(conn)
      if (!check.allowed) {
        let mins = Math.ceil((check.resetAt - Date.now()) / 60000)
        return m.reply(`⛔ Este bot no es Premium.\n\nHas alcanzado el límite de *10 descargas*.\n⌛ Intenta de nuevo en *${mins} minutos*.`)
      } else {
        console.log(`Bot normal → le quedan ${check.remaining} descargas.`)
      }
    }

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    let nombreBot = global.namebot || '⎯⎯⎯⎯⎯⎯ Bot Principal ⎯⎯⎯⎯⎯⎯'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
      } catch {}
    }

    let url = args[0]
    let videoInfo = null

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      let search = await yts(args.join(' '))
      if (!search.videos || search.videos.length === 0) {
        await conn.sendMessage(m.chat, { text: '⚠️ No se encontraron resultados.' }, { quoted: m })
        return
      }
      videoInfo = search.videos[0]
      url = videoInfo.url
    } else {
      let id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      let search = await yts({ videoId: id })
      if (search && search.title) videoInfo = search
    }

    if (videoInfo.seconds > 3780) {
      await conn.sendMessage(m.chat, {
        text: '❌ El video supera el límite de duración permitido (63 minutos).'
      }, { quoted: m })
      return
    }

    let apiUrl = ''
    let isAudio = false

    if (command == 'play' || command == 'ytmp3') {
      apiUrl = `https://myapiadonix.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`
      isAudio = true
    } else if (command == 'play2' || command == 'ytmp4') {
      apiUrl = `https://myapiadonix.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`
    } else {
      await conn.sendMessage(m.chat, {
        text: '❌ Comando no reconocido.'
      }, { quoted: m })
      return
    }

    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al conectar con la API.')
    let json = await res.json()
    if (!json.success) throw new Error('No se pudo obtener información del video.')

    let { title, thumbnail, quality, download } = json.data
    let duration = videoInfo?.timestamp || 'Desconocida'

    let details = `╭➤ *${title}*
┃
┃ ⏱️ Duración: *${duration}*
┃
┃ 🖥️ Calidad: *${quality}*
┃
┃ ❇️ Formato: *${isAudio ? 'Audio' : 'Video'}*
┃
┃ 📌 Fuente: *YouTube*
╰━━━━━━━━━━━━━━━━━━`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: details
    }, { quoted: m })

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: download },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: true
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: '❌ Se produjo un error al procesar la solicitud.'
    }, { quoted: m })
  }
}

handler.help = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.tags = ['downloader']
handler.command = ['play', 'play2', 'ytmp3', 'ytmp4']

export default handler
