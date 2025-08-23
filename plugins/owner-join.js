let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `⚠️ Ingresa el link de un grupo.\n\nEjemplo:\n.join https://chat.whatsapp.com/XXXXX`

  let link = args[0]
  if (!link.startsWith('https://chat.whatsapp.com/')) throw `❌ Ese no parece ser un link válido de invitación.`

  try {
    let res = await conn.groupAcceptInvite(link.split('https://chat.whatsapp.com/')[1])
    await m.reply(`✅ Me uní correctamente al grupo.`)
  } catch (e) {
    await m.reply(`❌ No pude unirme al grupo.\n\nError: ${e.message}`)
  }
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join']

handler.rowner = true // solo el owner puede usarlo

export default handler
