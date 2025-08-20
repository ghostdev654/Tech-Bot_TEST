// Comando: .ppt
let handler = async (m, { conn }) => {
  let botJid = conn.user?.jid || conn.user?.id
  let botProfile
  try {
    botProfile = await conn.getBusinessProfile(botJid)
  } catch {
    botProfile = null
  }
  const isBusiness = !!botProfile

  if (isBusiness) {
    // Solo texto si es Business
    await conn.sendMessage(m.chat, {
      text: "Elige: piedra, papel o tijera (escribe tu opción)"
    }, { quoted: m })
  } else {
    // Con botones interactivos si no es Business
    const sections = [
      {
        title: "Jugada",
        rows: [
          { title: "🪨 Piedra", rowId: ".ppt piedra" },
          { title: "📄 Papel", rowId: ".ppt papel" },
          { title: "✂️ Tijera", rowId: ".ppt tijera" }
        ]
      }
    ]
    await conn.sendMessage(m.chat, {
      text: "¿Qué eliges?",
      footer: "Piedra, papel o tijera",
      title: "🎮 Juego RPS",
      buttonText: "Elige tu jugada",
      sections
    }, { quoted: m })
  }
}

// Resolver jugada si el usuario responde con .ppt <opción>
handler.before = async (m, { conn }) => {
  if (!m.text) return
  if (!m.text.startsWith('.ppt ')) return

  let choice = m.text.slice(5).trim().toLowerCase()
  if (!["piedra", "papel", "tijera"].includes(choice)) return

  let botChoice = ["piedra", "papel", "tijera"][Math.floor(Math.random() * 3)]
  let result = ""

  if (choice === botChoice) {
    result = "🤝 ¡Empate!"
  } else if (
    (choice === "piedra" && botChoice === "tijera") ||
    (choice === "papel" && botChoice === "piedra") ||
    (choice === "tijera" && botChoice === "papel")
  ) {
    result = "🎉 ¡Ganaste!"
  } else {
    result = "😢 Perdiste..."
  }

  await conn.sendMessage(m.chat, {
    text: `Tú elegiste: *${choice}*\nYo elegí: *${botChoice}*\n\n${result}`
  }, { quoted: m })
}

handler.command = ["ppt"]
handler.tags = ["game"]
handler.registrer = true
export default handler
