let handler = async (m, { conn, args }) => {

  if (!args[0]) {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    return m.reply('🔒 Grupo cerrado indefinidamente.')
  }

  let time = ms(args[0])
  if (isNaN(time)) return m.reply('⏳ Uso correcto: *.cerrar 10m*')

  // Cierra
  await conn.groupSettingUpdate(m.chat, 'announcement')
  m.reply(`🔒 Grupo cerrado por *${args[0]}*`)

  // Programa la apertura
  setTimeout(async () => {
    try {
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      conn.reply(m.chat, '✅ El grupo ha sido reabierto automáticamente.', null)
    } catch (e) {
      console.error('❌ Error al reabrir grupo:', e)
    }
  }, time)
}
handler.help = ['cerrar [tiempo]']
handler.tags = ['group']
handler.command = /^cerrar$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
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
