let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `⚠️ Ingresa el link de un grupo.\n\nEjemplo:\n.join https://chat.whatsapp.com/XXXXX`

  let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
  let match = args[0].match(linkRegex)

  if (!match) throw `❌ Ese no parece ser un link válido de invitación.`

  try {
    let res = await conn.groupAcceptInvite(match[1])
    await m.reply(`✅ Me uní correctamente al grupo.`)
  } catch (e) {
    console.error(e)
    await m.reply(`❌ No pude unirme al grupo.\n\nError: ${e.message}`)
  }
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join']

handler.rowner = true // solo el owner puede usarlo

export default handler
