let handler = async (m, { conn, args, command }) => {
    // Verificar si el bot es Business
    let botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    let botProfile
    try {
        botProfile = await conn.getBusinessProfile(botJid)
    } catch {
        botProfile = null
    }
    if (botProfile) {
        return m.reply('❌ *El Numero del bot está en una cuenta de empresa.*\n\n> Escribe *#sercode* / *#serqr* para conectarte.')
    }

    // Validar argumento
    if (!args[0]) return m.reply(`❌ Uso: .${command} <número>\nEjemplo: .${command} 549112345678`)

    // Limpiar el número
    let number = args[0].replace(/[^0-9]/g, '')
    if (number.length < 8) return m.reply('❌ *Número inválido.*')

    // Verificar si está en WhatsApp
    let [result] = await conn.onWhatsApp(number + '@s.whatsapp.net')
    if (!result || !result.exists) return m.reply('❌ *El número no está registrado en WhatsApp.*')

    // Botones con el número incluido
    const buttons = [
        { buttonId: `#sercode ${number}`, buttonText: { displayText: '🔢 Código de 8 dígitos' }, type: 1 },
        { buttonId: `#serqr ${number}`, buttonText: { displayText: '📸 Escanear QR' }, type: 1 }
    ]

    const buttonMessage = {
        text: `*Selecciona una opción para conectarte como _Sub-Bot_*:\n📞 Número: *${number}*\n\n> Powered by: *Tech-Bot Team*`,
        buttons: buttons,
        headerType: 1
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['qr <número>', 'code <número>']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler
