import fs from 'fs'
import path from 'path'

let handler = async (m, { text, conn }) => {
  let mentioned = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
  let number

  if (mentioned) {
    number = mentioned.split('@')[0]
  } else if (text && text.replace(/[^0-9]/g, '')) {
    number = text.replace(/[^0-9]/g, '')
  } else {
    return m.reply('Debes mencionar al bot que quieres hacer principal o proporcionar su número. Ejemplo: .setprimary @bot o .setprimary 1234567890')
  }

  if (!number || number.length < 8) {
    return m.reply('Número inválido. Asegúrate de proporcionar un número de teléfono válido.')
  }

  let botJid = number + '@s.whatsapp.net'
  let subbotPath = path.join('./JadiBots', number, 'creds.json')

  // Validar si ese número tiene un subbot (existe el creds.json)
  if (!fs.existsSync(subbotPath)) {
    return m.reply(`El número *${number}* no corresponde a un Subbot válido (no se encontró su creds.json en JadiBots).`)
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  global.db.data.chats[m.chat].primaryBot = botJid

  m.reply(`✅ El bot principal para este grupo ahora es:\n*${botJid}*`)
}

handler.help = ['setprimary @bot | número']
handler.tags = ['serbot']
handler.command = ['setprimary']
handler.admin = true

export default handler
