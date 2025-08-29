// 📌 Evento: solicitudes de unión
export async function before(m, { conn }) {
  if (!m.isGroup) return

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}
  if (!chat.notifyRequest) return // Solo si está ON

  // Los eventos de solicitudes no vienen como "mensaje" normal,
  // por eso lo manejamos con "participants.update" abajo
}

// 📌 Escucha solicitudes de unión
export async function participantsUpdate({ id, participants, action }, conn) {
  if (action !== 'request') return
  let chat = global.db.data.chats[id]
  if (!chat?.notifyRequest) return

  for (let user of participants) {
    await conn.sendMessage(id, { 
      text: `📩 *Nueva solicitud de unión*\nEl usuario @${user.split('@')[0]} pidió unirse al grupo.`,
      mentions: [user]
    })
  }
}

// 📌 Comando para activar/desactivar
let handler = async (m, { conn, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(command)) {
    global.db.data.chats[m.chat].notifyRequest = true
    m.reply('✅ Avisos de solicitudes *activados* en este grupo.')
  } else if (/off/i.test(command)) {
    global.db.data.chats[m.chat].notifyRequest = false
    m.reply('❌ Avisos de solicitudes *desactivados* en este grupo.')
  }
}
handler.help = ['solicitud on', 'solicitud off']
handler.tags = ['group']
handler.command = /^solicitud(on|off)$/i
handler.admin = true
handler.group = true

export default handler
