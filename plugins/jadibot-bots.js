import fs from 'fs'
import ws from 'ws'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  // Cargar lista de premium
  let premium = []
  try {
    premium = JSON.parse(fs.readFileSync('./json/premium.json'))
  } catch {
    premium = []
  }

  for (const connSub of global.conns) {
    if (connSub.user && connSub.ws?.socket?.readyState !== ws.CLOSED) {
      const jid = connSub.user.jid
      const numero = jid?.split('@')[0]
      let nombre = connSub.user.name
      if (!nombre && typeof conn.getName === 'function') {
        try {
          nombre = await conn.getName(jid)
        } catch {
          nombre = `Usuario ${numero}`
        }
      }
      uniqueUsers.set(jid, {
        nombre: nombre || `Usuario ${numero}`,
        numero,
        isPremium: premium.includes(numero)
      })
    }
  }

  const uptime = process.uptime() * 1000
  const formatUptime = clockString(uptime)
  const totalUsers = uniqueUsers.size

  let txt = `*𝙏𝙚𝙘𝙝-𝘽𝙤𝙩 🔹𝐕𝟏 -- _Sub-Bots_*\n\n`
  txt += `⏳ *Runtime:* ${formatUptime}\n`
  txt += `👥 *Total Conectados:* ${totalUsers}\n`

  let mentions = []

  if (totalUsers > 0) {
    txt += `\n📋 *LISTA DE SUBBOTS*\n\n`
    let i = 1
    for (const [jid, data] of uniqueUsers) {
      txt += `📌 *${i++}.* ${data.nombre}\n`
      txt += `👤 @${data.numero}\n`
      txt += `⭐ Tipo: ${data.isPremium ? '🌟 Premium' : '🆓 Free'}\n\n`
      mentions.push(jid)
    }
  } else {
    txt += `\n⚠️ *No hay subbots conectados actualmente.*`
  }

  await conn.reply(m.chat, txt.trim(), m, { mentions })
}

handler.command = ['listjadibot', 'bots', 'subbots']
handler.help = ['bots']
handler.tags = ['serbot']
handler.register = true
export default handler

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}
