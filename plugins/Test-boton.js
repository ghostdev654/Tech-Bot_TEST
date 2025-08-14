let handler = async (m, { conn }) => {

  async function checkIsBusiness(conn, jid) {
    try {
      const profile = await conn.fetchBusinessProfile(jid)
      return !!(profile && Object.keys(profile).length)
    } catch {
      return false
    }
  }

  // Si cita a alguien, usa ese JID, si no, usa el del remitente
  let targetJid = m.quoted ? m.quoted.sender : m.sender

  const isBusiness = await checkIsBusiness(conn, targetJid)
  const nombre = await conn.getName(targetJid)

  let respuesta = isBusiness
    ? `✅ *${nombre}* usa *WhatsApp Business*.`
    : `❌ *${nombre}* usa *WhatsApp normal*.`

  await conn.reply(m.chat, respuesta, m)
}

handler.command = ["isbsn"]
export default handler
