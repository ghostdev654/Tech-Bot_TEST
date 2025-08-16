let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) throw '*⚠️ Este comando solo se puede usar en grupos.*'

  // Mensaje de confirmación
  let confirmMsg = await conn.sendMessage(m.chat, { text: `*⚠️ Confirmación requerida*\n\n¿Seguro que quieres expulsar a TODOS del grupo?\n\nReacciona con ✅ para confirmar o ❌ para cancelar.` }, { quoted: m })

  // Esperar reacción
  conn.ev.on('messages.reaction', async (reaction) => {
    try {
      if (!reaction.key.fromMe && reaction.key.id === confirmMsg.key.id && reaction.key.remoteJid === m.chat) {
        let emoji = reaction.text
        let userReact = reaction.key.participant || reaction.participant

        // Solo el dueño que ejecutó el comando puede confirmar
        if (userReact !== m.sender) return

        if (emoji === '✅') {
          await conn.sendMessage(m.chat, { text: '*✅ Purga confirmada, eliminando usuarios...*' })

          let toKick = participants
            .map(u => u.id)
            .filter(id => id !== conn.user.jid && id !== m.sender)

          for (let i = 0; i < toKick.length; i += 5) {
            let batch = toKick.slice(i, i + 5)
            await conn.groupParticipantsUpdate(m.chat, batch, 'remove')
            await new Promise(res => setTimeout(res, 1000)) // delay 1s
          }

          await conn.sendMessage(m.chat, { text: '*🚮 Purga finalizada.*' })

        } else if (emoji === '❌') {
          await conn.sendMessage(m.chat, { text: '*❌ Purga cancelada.*' })
        }
      }
    } catch (e) {
      console.error('Error en purga:', e)
    }
  })
}

handler.help = ['purga']
handler.tags = ['group']
handler.command = ['purga']
handler.rowner = true // SOLO el dueño real del bot puede usarlo

export default handler
