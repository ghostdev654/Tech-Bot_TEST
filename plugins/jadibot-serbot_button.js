let handler = async (m, { conn }) => {
    const buttons = [
        { buttonId: '#on_code', buttonText: { displayText: '🔢 Código de 8 dígitos' }, type: 1 },
        { buttonId: '#on_qr', buttonText: { displayText: '📸 Escanear QR' }, type: 1 }
    ]

    const buttonMessage = {
        text: '*Selecciona una opción para conectarte como _Sub-Bot_*:\n\n> Powered by: *Tech-Bot Team*',
        buttons: buttons,
        headerType: 1
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.tags = ["serbot"]
handler.help = ["subbot"]
handler.command = ["code", "qr", "serbot"]
export default handler
