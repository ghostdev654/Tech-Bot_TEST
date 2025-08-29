// 📌 Aviso de solicitudes de unión con handler.before
let handler = m => m
handler.before = async function (m, { conn }) {
  if (!m.isGroup) return

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}
  if (!chat.notifyRequest) return // si está en OFF, no hace nada

  // Baileys no manda la solicitud como mensaje normal,
  // llega en "m.messageStubType === 'GROUP_PARTICIPANT_ADD_REQUEST'"
  if (m.messageStubType === 129) { // 129 == solicitud de unión
    let user = m.messageStubParameters[0]
    await conn.sendMessage(m.chat, {
      text: `📩 *Nueva solicitud de unión*\nEl usuario @${user.split('@')[0]} pidió unirse.`,
      mentions: [user]
    })
  }
}

// 📌 Comando para on/off
let toggle = async (m, { command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(command)) {
    chat.notifyRequest = true
    m.reply('✅ Avisos de solicitudes activados en este grupo.')
  } else {
    chat.notifyRequest = false
    m.reply('❌ Avisos de solicitudes desactivados en este grupo.')
  }
}
toggle.help = ['solicitud on', 'solicitud off']
toggle.tags = ['group']
toggle.command = /^solicitud(on|off)$/i
toggle.admin = true
toggle.group = true

export default toggle
