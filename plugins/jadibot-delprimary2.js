let handler = async (m, { text }) => {
  // Obtenemos el chatId: puede ser el actual o uno pasado como texto
  let chatId = text?.trim() || m.chat

  // Validamos que exista en la DB
  if (!global.db.data.chats[chatId]) {
    return m.reply(`❌ No encontré datos para este grupo (${chatId}).`)
  }

  if (!global.db.data.chats[chatId].primaryBot) {
    return m.reply(`⚠️ Este grupo no tiene bot principal configurado.`)
  }

  // Borramos el primary
  let old = global.db.data.chats[chatId].primaryBot
  delete global.db.data.chats[chatId].primaryBot

  // Forzamos escritura en DB
  if (global.db.write) await global.db.write()

  m.reply(`🗑️ Se eliminó el bot principal:\n*${old}*\n\nGrupo: ${chatId}`)
}

handler.help = ['delprimaryid [chatId]']
handler.tags = ['serbot']
handler.command = /^delprimaryid$/i
handler.rowner = true
handler.group = false // lo podés usar también fuera de grupos

export default handler
