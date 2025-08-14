const handler = async (m, { conn }) => {
  try {
    // Si citó un mensaje, usamos ese JID, si no, el del autor
    let target = m.quoted ? m.quoted.sender : m.sender

    // Intentar resolver si es LID o no es un JID numérico
    if (!/@s\.whatsapp\.net$/.test(target)) {
      let res = await conn.onWhatsApp(target)
      if (res && res[0]?.jid) target = res[0].jid
    }

    // Intentar obtener número limpio
    let numero = target.split('@')[0]

    // Intentar obtener perfil Business
    let business = null
    try {
      business = await conn.fetchBusinessProfile(target)
    } catch (e) {
      // Si falla, ignoramos
    }

    let nombre = await conn.getName(target)

    if (business?.businessProfile) {
      await m.reply(`✅ *${nombre}* (${numero}) usa *WhatsApp Business*.`)
    } else {
      await m.reply(`❌ *${nombre}* (${numero}) usa *WhatsApp normal*.`)
    }
  } catch (err) {
    console.error(err)
    await m.reply('⚠️ No se pudo verificar el tipo de cuenta.')
  }
}

handler.command = ["isbsn"]
export default handler
