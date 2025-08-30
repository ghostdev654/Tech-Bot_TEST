let handler = async (m, { conn, args }) => {
 
  if (!args[0]) return m.reply(',✳️ *Uso correcto ›* .kicknum +212 o .kicknum 212')

  let prefix = args[0].replace(/\D/g, '') // solo números del prefijo

  if (!prefix) return m.reply('❌ Debes poner un código de país válido, ejemplo 212')

  try {
    let metadata = await conn.groupMetadata(m.chat)
    let participants = metadata.participants.map(p => p.id)
    let toKick = participants.filter(user => user.startsWith(prefix))

    if (toKick.length === 0) return m.reply(`❌ No encontré usuarios con el prefijo +${prefix} en el grupo.`)

    for (let user of toKick) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      } catch {}
    }

    let list = toKick.map(u => `@${u.split('@')[0]}`).join('\n')
    m.reply(`✅ Expulsé a los siguientes usuarios con prefijo +${prefix}:\n${list}`, null, { mentions: toKick })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al intentar expulsar usuarios.')
  }
}

handler.command = ['kicknum']
handler.help = ['kicknum']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
