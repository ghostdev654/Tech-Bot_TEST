let handler = async (m, { conn }) => {

  async function checkIsBusiness(jid) {
    // 1️⃣ Revisar si está en la agenda del bot
    let contactInfo = conn.contacts?.[jid] || conn.store?.contacts?.[jid]
    if (contactInfo && typeof contactInfo.isBusiness !== 'undefined') {
      return contactInfo.isBusiness
    }

    // 2️⃣ Si no hay datos, intentar consultar a WhatsApp
    try {
      const profile = await conn.fetchBusinessProfile(jid)
      return !!(profile && Object.keys(profile).length)
    } catch {
      return false
    }
  }

  // Detectar objetivo: citado o remitente
  let targetJid = m.quoted ? m.quoted.sender : m.sender
  const isBusiness = await checkIsBusiness(targetJid)
  const nombre = await conn.getName(targetJid)

  let respuesta = isBusiness
    ? `✅ *${nombre}* usa *WhatsApp Business*.`
    : `❌ *${nombre}* usa *WhatsApp normal*.`

  await conn.reply(m.chat, respuesta, m)
}

handler.command = ["isbsn"]
export default handler
