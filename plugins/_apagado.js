// comando para activar/desactivar bot en un grupo
let handler = async (m, { conn, isAdmin, isROwner, args }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {} // si no existe el grupo en DB

    if (!args[0]) return m.reply('⚙️ Usa:\n.bot 1 (activar)\n.bot 0 (desactivar)')

    switch (args[0]) {
        case '1':
            chat.botOff = false
            m.reply('✅ El bot fue ACTIVADO en este grupo.')
            break
        case '0':
            chat.botOff = true
            m.reply('⛔ El bot fue DESACTIVADO en este grupo.')
            break
        default:
            m.reply('⚠️ Solo se permite usar 1 (activar) o 0 (desactivar).')
    }
}

handler.help = ['bot <1/0>']
handler.tags = ['group']
handler.command = /^bot$/i
handler.group = true

export default handler
