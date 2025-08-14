let handler = async (m, { conn }) => {
    // Si cita a alguien, usa ese, si no, el remitente
    let targetJid = m.quoted ? m.quoted.sender : m.sender
    const nombre = await conn.getName(targetJid)

    try {
        // Forzar envío de vCard
        let contact = await conn.fetchStatus(targetJid).catch(() => null)
        let business = false

        // Truco: en WhatsApp Business casi siempre hay vCard con X-WA-BIZ-NAME
        let vcardCheck = await conn.sendMessage(m.chat, {
            contacts: {
                displayName: nombre,
                contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${nombre}\nTEL;type=CELL;waid=${targetJid.split('@')[0]}:${nombre}\nEND:VCARD` }]
            }
        }, { quoted: m }).catch(() => null)

        // Revisar si WhatsApp devolvió info Business
        if (vcardCheck?.messageStubParameters?.some(p => /X-WA-BIZ/i.test(p))) {
            business = true
        }

        let respuesta = business
            ? `✅ *${nombre}* usa *WhatsApp Business*.`
            : `❌ *${nombre}* usa *WhatsApp normal*.`

        await conn.reply(m.chat, respuesta, m)

    } catch (err) {
        console.error(err)
        await conn.reply(m.chat, '⚠️ Error al verificar.', m)
    }
}

handler.command = ["isbsn"]
export default handler
