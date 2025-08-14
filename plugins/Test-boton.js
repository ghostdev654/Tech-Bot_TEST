let handler = async (m, { conn }) => {

  async function checkIsBusiness(jid) {
    try {
      const profile = await conn.fetchBusinessProfile(jid)
      return !!(profile && Object.keys(profile).length)
    } catch {
      return false
    }
  }

  // Si cita a alguien, lo usa; si no, si pone "bot", revisa el bot; si no, revisa al remitente
  let targetJid
  if (m.text.toLowerCase().includes('bot')) {
    targetJid = conn.user.id // JID del propio bot
  } else {
    targetJid = m.quoted ? m.quoted.sender : m.sender
  }

  const isBusiness = await checkIsBusiness(targetJid)
  const nombre = await conn.getName(targetJid)

  let respuesta = isBusiness
    ? `✅ *${nombre}* usa *WhatsApp Business*.`
    : `❌ *${nombre}* usa *WhatsApp normal*.`

  await conn.reply(m.chat, respuesta, m)
}

handler.command = ["isbsn"]
export default handler
