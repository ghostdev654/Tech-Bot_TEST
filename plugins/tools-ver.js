let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply("⚠️ Responde a un mensaje de *una sola vista* (foto/video/audio).")

  let msg = m.quoted

  // Detectar viewOnce en cualquiera de sus formas
  let viewOnce = msg.message?.viewOnceMessage?.message 
              || msg.message?.viewOnceMessageV2?.message 
              || msg.message?.viewOnceMessageV2Extension?.message

  if (!viewOnce) {
    return m.reply("❌ Ese mensaje no es de una sola vista.")
  }

  // Tipo de archivo
  let type = Object.keys(viewOnce)[0]

  try {
    // Descargar el archivo
    let buffer = await conn.downloadMediaMessage({ message: viewOnce })

    // Preparar envío según tipo
    let opts = { quoted: m }
    if (type === "imageMessage") {
      await conn.sendFile(m.chat, buffer, "file.jpg", "🔓 Imagen recuperada", m)
    } else if (type === "videoMessage") {
      await conn.sendFile(m.chat, buffer, "file.mp4", "🔓 Video recuperado", m)
    } else if (type === "audioMessage") {
      await conn.sendFile(m.chat, buffer, "file.mp3", "", m, true)
    } else {
      m.reply("⚠️ Tipo de archivo no soportado aún.")
    }

  } catch (e) {
    console.error(e)
    m.reply("❌ Error al recuperar el archivo.")
  }
}

handler.command = ['ver_']
handler.help = ['ver (responde a un mensaje de 1 vista)']
handler.tags = ['tools']
export default handler
