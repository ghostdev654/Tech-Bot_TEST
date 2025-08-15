import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: '🌐 SUBBOTS',
  info: 'ℹ️ INFORMACIÓN',
  downloader: '⬇️ DESCARGAS',
  tools: '🛠️ HERRAMIENTAS',
  ia: '🤖 IA',
  owner: '👑 PROPIETARIO',
  game: '🎮 JUEGOS',
  group: '👥 GRUPOS',
  gacha: '🎲 GACHA ANIME',
  reacciones: '💕 ANIME REACCIONES',
  eco: '💸 ECONOMÍA',
  search: '🔎 BUSCADORES',
  sticker: '📌 STICKERS',
  channel: '📺 CANALES',
  fun: '😂 DIVERSIÓN',
}

const defaultMenu = {
  before: `
👋 Hola, soy %botname

🤖 TIPO:

> %tipo

> 👋 Hola %name, %greeting*

📅 Fecha: %date
⏳ Tiempo activo: %uptime
%readmore`.trimStart(),

  header: '\n*╭━━━━➤* %category ’',
  body: '┃ ° %cmd %islimit %isPremium',
  footer: '╰━━━━━━━━━━━━━━━',
  after: '\n> Powered By: Tech-Bot Team',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Verificar si el bot es Business
    let botJid = conn.user?.jid || conn.user?.id
    let botProfile
    try {
      botProfile = await conn.getBusinessProfile(botJid)
    } catch {
      botProfile = null
    }
    const isBusiness = !!botProfile

    const { exp, limit, level } = global.db.data.users[m.sender]  
    const { min, xp, max } = xpRange(level, global.multiplier)  
    const name = await conn.getName(m.sender)  

    const d = new Date(Date.now() + 3600000)  
    const locale = 'es'  
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })  

    const help = Object.values(global.plugins)  
      .filter(p => !p.disabled)  
      .map(plugin => ({  
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],  
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],  
        prefix: 'customPrefix' in plugin,  
        limit: plugin.limit,  
        premium: plugin.premium,  
      }))  

    let nombreBot = global.namebot || 'Bot'  
    let bannerFinal = './storage/img/menu.jpg'  

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')  
    const configPath = join('./JadiBots', botActual, 'config.json')  

    if (fs.existsSync(configPath)) {  
      try {  
        const config = JSON.parse(fs.readFileSync(configPath))  
        if (config.name) nombreBot = config.name  
        if (config.banner) bannerFinal = config.banner  
      } catch (err) {  
        console.log('⚠️ No se pudo leer config del subbot:', err)  
      }  
    }  

    const tipo = conn.user.jid === global.conn.user.jid  
      ? '𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹 🆅'  
      : '𝗦𝘂𝗯𝗕𝗼𝘁 🅱'  

    const menuConfig = conn.menu || defaultMenu  

    // SOLO EL SALUDO, SIN MENÚ de comandos
    const _textSaludo = menuConfig.before

    const replace = {  
      '%': '%',  
      p: _p,  
      botname: nombreBot,  
      taguser: '@' + m.sender.split('@')[0],  
      exp: exp - min,  
      maxexp: xp,  
      totalexp: exp,  
      xp4levelup: max - exp,  
      level,  
      limit,  
      name,  
      date,  
      uptime: clockString(process.uptime() * 1000),  
      tipo,  
      readmore: readMore,  
      greeting,  
    }  

    const textSaludo = _textSaludo.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    const isURL = typeof bannerFinal === 'string' && /^https?:\/\//i.test(bannerFinal)
    const imageContent = isURL
      ? { image: { url: bannerFinal } }
      : { image: fs.readFileSync(bannerFinal) }

    if (!isBusiness) {
      // Si NO es Business, añade botón de Categorías en tipo LISTA
      const sections = [
        {
          title: 'Categorías',
          rows: Object.entries(tags).map(([id, title]) => ({
            title,
            rowId: `#category ${id}`,
          }))
        }
      ]
      const listMessage = {
        ...imageContent,
        caption: textSaludo.trim(),
        footer: '',
        buttonText: '💡 Elegir Categoría',
        sections,
        headerType: 1,
        mentionedJid: conn.parseMention(textSaludo)
      }
      await conn.sendMessage(m.chat, listMessage, { quoted: m })
    } else {
      // Si es Business, envía el menú completo como texto (como antes)
      const _text = [
        menuConfig.before,
        ...Object.keys(tags).map(tag => {
          return [
            menuConfig.header.replace(/%category/g, tags[tag]),
            help.filter(menu => menu.tags?.includes(tag)).map(menu =>
              menu.help.map(helpText =>
                menuConfig.body
                  .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                  .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                  .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                  .trim()
              ).join('\n')
            ).join('\n'),
            menuConfig.footer,
          ].join('\n')
        }),
        menuConfig.after
      ].join('\n')

      const text = _text.replace(
        new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
        (_, name) => String(replace[name])
      )

      await conn.sendMessage(m.chat, {
        ...imageContent,
        caption: text.trim(),
        mentionedJid: conn.parseMention(text)
      }, { quoted: m })
    }

  } catch (e) {
    console.error('❌ Error en el menú:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

handler.command = ['menu', 'help', 'menú']
handler.register = true
export default handler

// Utilidades
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const ase = new Date()
let hour = ase.getHours()

const greetingMap = {
  0: 'una linda noche 🌙', 1: 'una linda noche 💤', 2: 'una linda noche 🦉',
  3: 'una linda mañana ✨', 4: 'una linda mañana 💫', 5: 'una linda mañana 🌅',
  6: 'una linda mañana 🌄', 7: 'una linda mañana 🌅', 8: 'una linda mañana 💫',
  9: 'una linda mañana ✨', 10: 'un lindo día 🌞', 11: 'un lindo día 🌨',
  12: 'un lindo día ❄', 13: 'un lindo día 🌤', 14: 'una linda tarde 🌇',
  15: 'una linda tarde 🥀', 16: 'una linda tarde 🌹', 17: 'una linda tarde 🌆',
  18: 'una linda noche 🌙', 19: 'una linda noche 🌃', 20: 'una linda noche 🌌',
  21: 'una linda noche 🌃', 22: 'una linda noche 🌙', 23: 'una linda noche 🌃',
}
var greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')
