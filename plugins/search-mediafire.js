import axios from 'axios'
import cheerio from 'cheerio'
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

// 🌀 Función para mezclar resultados
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 🔰 Buscar archivos en MediaFireTrend
async function mfsearch(query) {
  if (!query) throw new Error('🪭 Debes escribir algo para buscar.')

  let html
  try {
    const resp = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    html = resp.data
  } catch (err) {
    throw new Error('🦖 MediafireTrend no responde (Error 503)')
  }

  const $ = cheerio.load(html)
  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
  ).slice(0, 10)

  if (!links.length) throw new Error('🐛 No se encontraron resultados.')

  const result = await Promise.all(links.map(async (link) => {
    try {
      const { data } = await axios.get(`https://mediafiretrend.com${link}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const $ = cheerio.load(data)
      const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
      const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/)
      const decoded = cheerio.load(decodeURIComponent(match?.[1] || ''))

      return {
        filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
        filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
        url: decoded('a').attr('href'),
        source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
        source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
      }
    } catch {
      return null
    }
  }))

  return result.filter(v => v && v.url)
}

// 🎋 Handler del comando
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
    }
  if (!text) return m.reply('✳️ *Usa el comando así:* .mediafiresearch config ff')

  await m.reply('🦞 Buscando archivos en *Mediafire*...')

  try {
    let results = await mfsearch(text)

    if (!results.length) return m.reply('❌ No se encontró nada con esa búsqueda.')

    conn.mfsearch = conn.mfsearch || {}
    conn.mfsearch[m.sender] = {
      data: results,
      timeout: setTimeout(() => delete conn.mfsearch[m.sender], 10 * 60 * 1000)
    }

    const top3 = results.slice(0, 3)
    const buttons = top3.map((v, i) => ({
      buttonId: `${usedPrefix}mediafire ${v.url}`,
      buttonText: { displayText: `📦 ${i + 1}. ${v.filename.slice(0, 25)}` },
      type: 1
    }))

    await conn.sendMessage(m.chat, {
      text: `🔎 *Resultados para:* ${text}\n\n🗂️ Archivos encontrados en Mediafire.\n🦁 Elige uno para descargar:`,
      footer: `🫟 Mostrando los 3 mejores de ${results.length} resultados`,
      buttons,
      headerType: 1,
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['mediafiresearch']
handler.tags = ['search']
handler.command = ['mediafiresearch']
handler.register = true
export default handler
