let handler = async (m, { conn }) => {
  // Aseguramos la estructura en DB
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  // Si no había nada guardado
  if (!global.db.data.chats[m.chat].primaryBot) {
    return m.reply('⚠️ No hay ningún bot principal configurado en este grupo.')
  }

  // Eliminamos el bot principal
  delete global.db.data.chats[m.chat].primaryBot

  // Forzamos escritura en el JSON
  if (global.db.write) await global.db.write()

  m.reply('❌ Se eliminó el bot principal de este grupo.')
}

handler.help = ['delprimary']
handler.tags = ['serbot']
handler.command = ['delprimary']
handler.admin = true
handler.group = true

export default handler
