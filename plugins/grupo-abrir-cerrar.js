let handler = async (m, { conn, command }) => {
   
  let action = command === 'abrirgrupo' ? 'not_announcement' : 'announcement'
  await conn.groupSettingUpdate(m.chat, action)

  let estado = command === 'abrirgrupo'
    ? '✅ Grupo *abierto* — todos pueden enviar mensajes.'
    : '🔒 Grupo *cerrado* — solo administradores pueden enviar mensajes.'

  await conn.reply(m.chat, estado, m)
}

handler.help = ['abrirgrupo', 'cerrargrupo']
handler.tags = ['grupo']
handler.command = ['abrirgrupo', 'cerrargrupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
