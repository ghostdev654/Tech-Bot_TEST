let handler = async (m, { conn }) => {

  async function checkIsBusiness(conn, jid) {
    try {
      const profile = await conn.fetchBusinessProfile(jid)
      return !!(profile && Object.keys(profile).length)
    } catch {
      return false // si falla, asumimos que no es business
    }
  }

  const isBusinessUser = await checkIsBusiness(conn, m.sender)
  const isBusinessBot = await checkIsBusiness(conn, conn.user.jid)

  let info = `📊 *Detección Business*
👤 Usuario: ${isBusinessUser ? 'Sí' : 'No'}
🤖 Bot: ${isBusinessBot ? 'Sí' : 'No'}`

  const imageContent = { url: 'https://telegra.ph/file/63b403e8a6d8d07c1582d.jpg' }

  if (isBusinessUser || isBusinessBot) {
    // Si es Business → sin botones
    await conn.sendMessage(m.chat, {
      image: imageContent,
      caption: info
    }, { quoted: m })
  } else {
    // Si no es Business → con botón de prueba
    try {
      const buttons = [
        { buttonId: '#ping', buttonText: { displayText: 'Ping' }, type: 1 }
      ]
      await conn.sendMessage(m.chat, {
        image: imageContent,
        caption: info,
        footer: 'Botón de prueba',
        buttons,
        headerType: 4
      }, { quoted: m })
    } catch {
      // Si falla el envío con botones → sin botones
      await conn.sendMessage(m.chat, {
        image: imageContent,
        caption: info + '\n\n(❌ Falló el envío con botones)'
      }, { quoted: m })
    }
  }
}

handler.command = ["test1"]
handler.rowner = true
hanlder.tags = ["owner]
export default handler
