import fs from "fs"

let partidas = {} // Guardamos partidas activas

let handler = async (m, { conn, text }) => {
  let id = m.chat
  if (!partidas[id]) partidas[id] = null

  // Iniciar juego
  if (text.toLowerCase() === "start") {
    const palabras = ["PROGRAMADOR", "DISCORD", "JAVASCRIPT", "BAILEYS", "CHATGPT", "MUSICA", "WHATSAPP"]
    let palabra = palabras[Math.floor(Math.random() * palabras.length)]

    partidas[id] = {
      palabra,
      progreso: "_ ".repeat(palabra.length).trim().split(" "),
      intentos: 6,
      usadas: []
    }

    return conn.reply(m.chat, `🎮 *Ahorcado iniciado*\n\nPalabra: ${partidas[id].progreso.join(" ")}\n\nEnvia una letra para adivinar.\nTienes ${partidas[id].intentos} vidas.`, m)
  }

  // Si no hay partida en curso
  if (!partidas[id]) {
    return conn.reply(m.chat, `❌ No hay ninguna partida activa.\nEscribe *start* para iniciar.`, m)
  }

  let game = partidas[id]
  let letra = text?.trim()?.toUpperCase()
  if (!letra || letra.length !== 1 || !/[A-ZÑ]/.test(letra)) return // Ignorar mensajes no válidos

  // Ya usada
  if (game.usadas.includes(letra)) {
    return conn.reply(m.chat, `⚠️ La letra *${letra}* ya fue usada.\nIntentá otra.`, m)
  }

  game.usadas.push(letra)

  if (game.palabra.includes(letra)) {
    // Actualizar progreso
    for (let i = 0; i < game.palabra.length; i++) {
      if (game.palabra[i] === letra) {
        game.progreso[i] = letra
      }
    }
  } else {
    game.intentos--
  }

  // Ver si ganó
  if (!game.progreso.includes("_")) {
    conn.reply(m.chat, `🎉 ¡Ganaste!\nLa palabra era: *${game.palabra}*`, m)
    delete partidas[id]
    return
  }

  // Ver si perdió
  if (game.intentos <= 0) {
    conn.reply(m.chat, `💀 Perdiste.\nLa palabra era: *${game.palabra}*`, m)
    delete partidas[id]
    return
  }

  // Mostrar progreso
  conn.reply(m.chat, `\n${game.progreso.join(" ")}\n\n❌ Letras usadas: ${game.usadas.join(", ")}\n❤️ Vidas restantes: ${game.intentos}`, m)
}

handler.help = ["ahorcado"]
handler.tags = ["game"]
handler.command = /^ahorcado$/i

export default handler
