import fs from 'fs'
let file = './cerrados.json'
let cerrados = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('⏳ Uso correcto: *.cerrar 10m*')

  let time = ms(args[0])
  if (isNaN(time)) return m.reply('⏳ Uso correcto: *.cerrar 10m*')

  let fin = Date.now() + time

  // Cierra el grupo
  await conn.groupSettingUpdate(m.chat, 'announcement')
  m.reply(`🔒 Grupo cerrado por *${args[0]}*`)

  // Guarda en JSON
  cerrados[m.chat] = fin
  fs.writeFileSync(file, JSON.stringify(cerrados, null, 2))

  // Programa apertura
  programarApertura(conn, m.chat, fin)
}

handler.help = ['cerrar [tiempo]']
handler.tags = ['group']
handler.command = /^cerrar$/i
handler.group = true
handler.admin = true

export default handler

// Conversor de tiempo tipo "5s/5m/5h" a ms
function ms(str) {
  let m = str.match(/^(\d+)(s|m|h)$/)
  if (!m) return NaN
  let val = parseInt(m[1])
  let unit = m[2]
  switch (unit) {
    case 's': return val * 1000
    case 'm': return val * 60 * 1000
    case 'h': return val * 60 * 60 * 1000
  }
}

// 🔓 Reprograma aperturas al iniciar
function programarApertura(conn, chat, fin) {
  let delay = fin - Date.now()
  if (delay <= 0) {
    abrir(conn, chat)
    return
  }
  setTimeout(() => abrir(conn, chat), delay)
}

async function abrir(conn, chat) {
  try {
    await conn.groupSettingUpdate(chat, 'not_announcement')
    await conn.sendMessage(chat, { text: '✅ El grupo ha sido reabierto automáticamente.' })
  } catch (e) {
    console.error('❌ Error al reabrir grupo:', e)
  }
  delete cerrados[chat]
  fs.writeFileSync(file, JSON.stringify(cerrados, null, 2))
}

// 🚀 Al iniciar el bot, reprogramar los que queden pendientes
setTimeout(() => {
  for (let chat in cerrados) {
    programarApertura(global.conn, chat, cerrados[chat])
  }
}, 3000) // se espera 3s para que global.conn esté listo
