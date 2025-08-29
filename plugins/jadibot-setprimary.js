let handler = async (m, { text }) => {
  // Obtenemos el número ya sea por mención o texto
  let number = (m.mentionedJid && m.mentionedJid[0]?.replace('@s.whatsapp.net', '')) 
             || (text ? text.replace(/[^0-9]/g, '') : '')

  if (!number) {
    return m.reply('⚠️ Debes etiquetar al bot o escribir el número para hacerlo principal en este grupo.\n\nEjemplo:\n- !setprimary @bot\n- !setprimary 5491122334455')
  }

  let botJid = number + '@s.whatsapp.net'

  // Aseguramos la estructura en DB
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  // Guardamos en DB
  global.db.data.chats[m.chat].primaryBot = botJid

  // Forzamos escritura en el JSON de db
  if (global.db.write) await global.db.write()

  m.reply(`✅ El bot principal para este grupo ahora es:\n*${botJid}*`)
}

handler.help = ['setprimary @bot / número']
handler.tags = ['serbot']
handler.command = ['setprimary']
handler.admin = true
handler.group = true

export default handler
