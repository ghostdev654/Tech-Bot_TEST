let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) throw '*⚠️ Este comando solo se puede usar en grupos.*'

  // Guardar quién ejecutó el comando
  let executor = m.sender

  // Enviar confirmación
  await conn.sendMessage(m.chat, { text: `*⚠️ Confirmación requerida*\n\n¿Seguro que quieres expulsar a TODOS del grupo?\n\nResponde con *si* o *no* (solo ${executor.split('@')[0]} puede responder).` }, { quoted: m })

  // Crear listener temporal
  let confirmation = async (resp) => {
    try {
      if (!resp.messages) return
      let ms = resp.messages[0]
      if (!ms.message?.conversation) return

      let txt = ms.message.conversation.toLowerCase().trim()
      let sender = ms.key.participant || ms.key.remoteJid

      // Solo aceptar respuesta del mismo owner que ejecutó
      if (sender !== executor || ms.key.remoteJid !== m.chat) return

      if (txt === 'si') {
        await conn.sendMessage(m.chat, { text: '*✅ Purga confirmada, eliminando usuarios...*' })
        let toKick = participants
          .map(u => u.id)
          .filter(id => id !== conn.user.jid && id !== executor)

        for (let i = 0; i < toKick.length; i += 5) {
          let batch = toKick.slice(i, i + 5)
          try {
            await conn.groupParticipantsUpdate(m.chat, batch, 'remove')
          } catch (e) {
            console.error('Error expulsando:', e)
          }
          await new Promise(res => setTimeout(res, 1000)) // delay 1s
        }

        await conn.sendMessage(m.chat, { text: '*🚮 Purga finalizada.*' })
        conn.ev.off('messages.upsert', confirmation) // apagar listener
      }

      if (txt === 'no') {
        await conn.sendMessage(m.chat, { text: '*❌ Purga cancelada.*' })
        conn.ev.off('messages.upsert', confirmation) // apagar listener
      }
    } catch (e) {
      console.error('Error en confirmación purga:', e)
    }
  }

  conn.ev.on('messages.upsert', confirmation)
}

handler.help = ['purga']
handler.tags = ['group']
handler.command = ['purga']
handler.rowner = true // SOLO el dueño real del bot puede usarlo

export default handler
