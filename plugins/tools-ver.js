let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply("⚠️ Responde a un mensaje de *una sola vista* (foto/video/audio).")

  let msg = m.quoted

  // Validar si es viewOnce
  if (!msg.message?.viewOnceMessageV2 && !msg.message?.viewOnceMessageV2Extension) {
    return m.reply("❌ Ese mensaje no es de una sola vista.")
  }

  // Obtener el mensaje real adentro
  let viewOnce = msg.message?.viewOnceMessageV2?.message || msg.message?.viewOnceMessageV2Extension?.message
  let type = Object.keys(viewOnce)[0]

  try {
    // Descargar el archivo
    let buffer = await conn.downloadMediaMessage({ message: viewOnce })
    
    // Enviar como normal
    await conn.sendFile(m.chat, buffer, type + ".mp4", "🔓 Recuperado con éxito", m)

  } catch (e) {
    console.error(e)
    m.reply("❌ Error al recuperar el archivo.")
  }
}

handler.command = ['ver']
handler.help = ['ver (responde a un mensaje de 1 vista)']
handler.tags = ['tools']
export default handler
