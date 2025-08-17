// plugins/daradmin.js
const daradmin = async (m, { conn, isOwner }) => {
  try {
    const chatId = m.chat
    if (!chatId.endsWith('@g.us')) return m.reply('⚠️ Este comando solo se puede usar en grupos.')

    await conn.sendMessage(chatId, { react: { text: '🔥', key: m.key } })

    const groupMetadata = await conn.groupMetadata(chatId)
    const senderId = m.sender
    const senderParticipant = groupMetadata.participants.find(p => p.id === senderId)
    const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')

    if (!isSenderAdmin && !isOwner) {
      return m.reply('⚠️ Solo los administradores o el propietario pueden otorgar derechos de admin.')
    }

    let targetId = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])
    if (!targetId) {
      return m.reply('⚠️ Debes responder a un mensaje o mencionar a un usuario para promoverlo.')
    }

    await conn.groupParticipantsUpdate(chatId, [targetId], 'promote')
    await conn.sendMessage(chatId, {
      text: `✅ Se ha promovido a @${targetId.split('@')[0]} a administrador.`,
      mentions: [targetId]
    }, { quoted: m })

    await conn.sendMessage(chatId, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('❌ Error en daradmin:', e)
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al otorgar derechos de admin.' }, { quoted: m })
  }
}

daradmin.command = ["daradmin", "promote", "daradmins"]
daradmin.help = ['daradmin']
daradmin.tags = ['group']
export default daradmin
