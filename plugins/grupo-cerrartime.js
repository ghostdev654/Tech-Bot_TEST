import fs from 'fs'

let file = './json/cerrados.json'
let cerrados = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

// Guardar al cerrar
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('⏳ Uso correcto: *.cerrar 10m*')

  let time = ms(args[0])
  if (isNaN(time)) return m.reply('⏳ Uso correcto: *.cerrar 10m*')

  let reopenAt = Date.now() + time

  // Guardar en json
  cerrados[m.chat] = reopenAt
  fs.writeFileSync(file, JSON.stringify(cerrados, null, 2))

  // Cierra
  await conn.groupSettingUpdate(m.chat, 'announcement')
  m.reply(`🔒 Grupo cerrado por *${args[0]}*`)
}

handler.help = ['cerrar [tiempo]']
handler.tags = ['group']
handler.command = /^cerrar$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler

// Conversor
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
