let handler = async (m, { conn, command, text }) => {
  if (!text && !m.mentionedJid[0] && !m.quoted) return m.reply(`⚠️ Usa: .${command} @user / número / reply`)

  // obtener el ID del user
  let user = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
      ? m.quoted.sender 
      : text.replace(/[^0-9]/g, '') + "@s.whatsapp.net"

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].muted) global.db.data.chats[m.chat].muted = []

  if (command == "mute") {
    if (global.db.data.chats[m.chat].muted.includes(user)) 
      return m.reply(`⚠️ El usuario ya estaba muteado.`)
    
    global.db.data.chats[m.chat].muted.push(user)
    m.reply(`🔇 Usuario @${user.split('@')[0]} muteado.`, null, { mentions: [user] })
  } 

  if (command == "unmute") {
    if (!global.db.data.chats[m.chat].muted.includes(user)) 
      return m.reply(`⚠️ El usuario no estaba muteado.`)
    
    global.db.data.chats[m.chat].muted = global.db.data.chats[m.chat].muted.filter(u => u !== user)
    m.reply(`🔊 Usuario @${user.split('@')[0]} desmuteado.`, null, { mentions: [user] })
  }
}

handler.help = ["mute", "unmute"].map(v => v + " @user")
handler.tags = ["group"]
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true

// middleware dentro del mismo plugin
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.muted) return
  if (chat.muted.includes(m.sender)) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          fromMe: m.key.fromMe,
          participant: m.key.participant
        }
      })
    } catch (e) {
      console.log("❌ No pude borrar mensaje muteado:", e)
    }
  }
}

export default handler
