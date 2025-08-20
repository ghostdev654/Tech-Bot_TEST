import fs from 'fs'

// === Comando para iniciar el juego ===
const handler = async (m, { conn }) => {
  let botJid = conn.user?.jid || conn.user?.id
  let botProfile
  try {
    botProfile = await conn.getBusinessProfile(botJid)
  } catch {
    botProfile = null
  }
  const isBusiness = !!botProfile

  if (isBusiness) {
    // Business = solo texto
    return m.reply(
      `🎮 *Piedra, Papel o Tijera* 🎮\n\n` +
      `Elige tu jugada respondiendo con:\n` +
      `1 = 🪨 Piedra\n` +
      `2 = 📄 Papel\n` +
      `3 = ✂️ Tijera`
    )
  } else {
    // Normal = con botones
    const buttons = [
      { buttonId: 'ppt_piedra', buttonText: { displayText: '🪨 Piedra' }, type: 1 },
      { buttonId: 'ppt_papel', buttonText: { displayText: '📄 Papel' }, type: 1 },
      { buttonId: 'ppt_tijera', buttonText: { displayText: '✂️ Tijera' }, type: 1 }
    ]
    return await conn.sendMessage(m.chat, {
      text: '🎮 *Piedra, Papel o Tijera*\n\nElige tu jugada:',
      footer: 'Juego clásico',
      buttons,
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^ppt$/i
handler.help = ['ppt']
handler.tags = ['game']

// === Resolver jugada (before) ===
handler.before = async (m, { conn }) => {
  if (!m.message) return

  let botJid = conn.user?.jid || conn.user?.id
  let botProfile
  try {
    botProfile = await conn.getBusinessProfile(botJid)
  } catch {
    botProfile = null
  }
  const isBusiness = !!botProfile

  const choices = ['🪨 Piedra', '📄 Papel', '✂️ Tijera']
  const botChoice = choices[Math.floor(Math.random() * choices.length)]

  // Caso Business: texto 1, 2, 3
  if (isBusiness && /^[123]$/.test(m.text)) {
    const userChoice = choices[parseInt(m.text) - 1]
    let result = getResult(userChoice, botChoice)
    await conn.sendMessage(m.chat, { text: `Tú: ${userChoice}\nBot: ${botChoice}\n\n${result}` }, { quoted: m })
    return true
  }

  // Caso normal: botones
  if (m.message?.buttonsResponseMessage) {
    let id = m.message.buttonsResponseMessage.selectedButtonId
    if (!id.startsWith('ppt_')) return

    let userChoice = id === 'ppt_piedra' ? choices[0] : id === 'ppt_papel' ? choices[1] : choices[2]
    let result = getResult(userChoice, botChoice)
    await conn.sendMessage(m.chat, { text: `Tú: ${userChoice}\nBot: ${botChoice}\n\n${result}` }, { quoted: m })
    return true
  }
}

function getResult(user, bot) {
  if (user === bot) return '🤝 ¡Empate!'
  if (
    (user.includes('Piedra') && bot.includes('Tijera')) ||
    (user.includes('Papel') && bot.includes('Piedra')) ||
    (user.includes('Tijera') && bot.includes('Papel'))
  ) return '🎉 ¡Ganaste!'
  return '😢 Perdiste...'
}

export default handler
