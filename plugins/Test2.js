let handler = async (m, { conn }) => {
  try {
    // conn.user.jid trae el JID completo, ej: "1234567890:11@s.whatsapp.net"
    let botJid = conn.user?.jid || conn.user?.id 

    // Extraemos solo el número
    let botNumber = botJid.split('@')[0].replace(/[^0-9]/g, '')

    m.reply(`📱 Mi número real es: *${botNumber}*`)
  } catch (e) {
    console.error(e)
    m.reply('❌ No pude obtener mi número.')
  }
}

handler.command = /^botnum$/i

export default handler
