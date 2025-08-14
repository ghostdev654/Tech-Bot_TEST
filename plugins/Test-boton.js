let handler = async (m, { conn, args }) => {
  if (args.length < 1) {
    return m.reply('Uso: .isbsn <número>\nEjemplo: .isbsn 57123456789')
  }

  let number = args[0].replace(/[^0-9]/g, '')
  if (!number || number.length < 8) {
    return m.reply('Número inválido.')
  }

  let jid = number + '@s.whatsapp.net'
  let isBusiness = false
  try {
    const profile = await conn.fetchBusinessProfile(jid)
    isBusiness = !!profile
  } catch {
    isBusiness = false
  }

  m.reply(`El número *${number}* ${isBusiness ? 'es una cuenta de WhatsApp Business.' : 'NO es una cuenta de WhatsApp Business.'}`)
}

handler.help = ['isbsn <número>']
handler.tags = ['tools']
handler.command = ['isbsn']

export default handler
