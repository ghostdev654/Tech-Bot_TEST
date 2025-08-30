let handler = async (m, { conn }) => {
  
  let link = await conn.groupInviteCode(m.chat)
  m.reply(`🔗 Link del grupo:\nhttps://chat.whatsapp.com/${link}`)
}

handler.help = ['damelink']
handler.tags = ['group']
handler.command = ['damelink', 'link']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
