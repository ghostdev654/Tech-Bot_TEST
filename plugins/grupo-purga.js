let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) throw '*⚠️ Este comando solo se puede usar en grupos.*'

  if (!handler.rowner) throw '*⚠️ Solo el dueño puede usar este comando.*'
  let executor = m.sender

  // Enviar confirmación
  await conn.sendMessage(m.chat, { text: `*⚠️ Confirmación requerida*\n\n¿Seguro que quieres expulsar a TODOS del grupo?\n\nResponde con *si* o *no* (solo ${executor.split('@')[0]} puede responder).` }, { quoted: m })

  // Esperar respuesta del owner
  const filter = (msg) => {
    if (!msg.message?.conversation) return false
    let txt = msg.message.conversation.toLowerCase().trim()
    let sender = msg.key.participant || msg.key.remoteJid
    return sender === executor && (txt === 'si' || txt === 'no') && msg.key.remoteJid === m.chat
  }

  const waitResponse = async () => {
    return new Promise(resolve => {
      const handlerMsg = (res) => {
        if (res.messages && res.messages[0] && filter(res.messages[0])) {
          conn.ev.off('messages.upsert', handlerMsg)
          resolve(res.messages[0].message.conversation.toLowerCase().trim())
        }
      }
      conn.ev.on('messages.upsert', handlerMsg)

      // Timeout 30s
      setTimeout(() => {
        conn.ev.off('messages.upsert', handlerMsg)
        resolve(null)
      }, 30000)
    })
  }

  let answer = await waitResponse()

  if (!answer) {
    return await conn.sendMessage(m.chat, { text: '*⏱ Tiempo agotado. Purga cancelada.*' })
  }

  if (answer === 'no') {
    return await conn.sendMessage(m.chat, { text: '*❌ Purga cancelada.*' })
  }

  if (answer === 'si') {
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
  }
}

handler.help = ['purga']
handler.tags = ['group']
handler.command = ['purga']
handler.rowner = true

export default handler
