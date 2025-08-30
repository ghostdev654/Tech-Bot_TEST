let handler = async (m, { conn, args, isAdmin, isROwner }) => {
  if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
  if (!args[0]) {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    return m.reply('🔒 Grupo cerrado indefinidamente.')
  }

  let time = ms(args[0])
  if (isNaN(time)) return m.reply('⏳ Uso correcto: *.cerrargrupo 10m*')

  await conn.groupSettingUpdate(m.chat, 'announcement')
  m.reply(`🔒 Grupo cerrado por *${args[0]}*`)

  setTimeout(async () => {
    try {
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      conn.reply(m.chat, '✅ El grupo ha sido reabierto automáticamente.', null)
    } catch (e) {
      console.error(e)
    }
  }, time)
}
handler.help = ['cerrar [tiempo]']
handler.tags = ['group']
handler.command = /^cerrargrupo$/i
handler.group = true
export default handler

// Función para parsear el tiempo
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
