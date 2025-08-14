let handler = async (m, { conn, args }) => {
  if (args.length < 1) {
    return m.reply('Uso: .isbsn <número>\nEjemplo: .isbsn 5491128967565')
  }

  let number = args[0].replace(/[^0-9]/g, '')
  if (!number || number.length < 8) {
    return m.reply('Número inválido.')
  }

  let jid = number + '@s.whatsapp.net'
  let v
  try {
    v = await conn.getBusinessProfile(jid)
  } catch {
    v = null
  }
  if (!v) return m.reply("No es business")
  return m.reply("Es Business")
}

handler.help = ['isbsn <número>']
handler.tags = ['tools']
handler.command = ['isbsn']

export default handler
