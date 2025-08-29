let handler = async (m, { conn, isAdmin, isROwner, args }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {} // seguridad por si no existe

    if (!args[0]) return m.reply('⚙️ Usa:\n.bot 1 (activar)\n.bot 0 (desactivar)')

    if (args[0] === '1') {
        chat.isBanned = false
        m.reply('✅ Bot ACTIVADO en este grupo.')
    } else if (args[0] === '0') {
        chat.isBanned = true
        m.reply('⛔ Bot DESACTIVADO en este grupo.')
    } else {
        m.reply('⚠️ Solo se permite usar 1 (activar) o 0 (desactivar).')
    }
}

handler.help = ['bot <1/0>']
handler.tags = ['group']
handler.command = /^bot$/i
handler.group = true

export default handler
