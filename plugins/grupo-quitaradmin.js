let handler = async (m, { conn, participants, command, text }) => {
  if (!text && !m.mentionedJid[0] && !m.quoted) 
    return m.reply(`⚠️ Usa: .${command} @user / reply`)

  // obtener el user
  let user = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
      ? m.quoted.sender 
      : text.replace(/[^0-9]/g, '') + "@s.whatsapp.net"

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], "demote")
    m.reply(`⏬ Usuario @${user.split('@')[0]} fue degradado a *miembro*.`, null, { mentions: [user] })
  } catch (e) {
    m.reply("❌ No pude degradar al usuario, revisa permisos.")
    console.log(e)
  }
}

handler.help = ["demote @user"]
handler.tags = ["group"]
handler.command = /^demote$/i
handler.group = true
handler.admin = true

export default handler
