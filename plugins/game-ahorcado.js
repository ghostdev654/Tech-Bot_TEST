// ./plugins/arcado.js
import fs from 'fs'

let partidas = {} // Guardamos partidas por chatId

// 🎮 Comando para iniciar
let handler = async (m, { conn, command }) => {
  let palabras = ["PROGRAMAR", "DISCORD", "JAVASCRIPT", "ARGENTINA", "ARCADE"]
  let palabra = palabras[Math.floor(Math.random() * palabras.length)]

  partidas[m.chat] = {
    palabra,
    progreso: Array(palabra.length).fill("_"),
    intentos: 6,
    letrasUsadas: []
  }

  await conn.sendMessage(m.chat, { text: `🎮 *Juego de Arcado iniciado*\n\n${partidas[m.chat].progreso.join(" ")}\n\nResponde este mensaje con una letra.` }, { quoted: m })
}

handler.command = /^arcado$/i
export default handler

// 🎯 Handler global para capturar letras
export async function all(m, { conn }) {
  if (!m.quoted) return // Solo responde si contestan a un mensaje
  let partida = partidas[m.chat]
  if (!partida) return

  let letra = (m.text || "").trim().toUpperCase()
  if (!/^[A-ZÑ]$/.test(letra)) return // Acepta solo una letra válida

  if (partida.letrasUsadas.includes(letra)) {
    return conn.sendMessage(m.chat, { text: `⚠️ Ya usaste la letra *${letra}*` }, { quoted: m })
  }

  partida.letrasUsadas.push(letra)

  if (partida.palabra.includes(letra)) {
    // Reemplazar guiones por letras correctas
    for (let i = 0; i < partida.palabra.length; i++) {
      if (partida.palabra[i] === letra) {
        partida.progreso[i] = letra
      }
    }
  } else {
    partida.intentos--
  }

  if (!partida.progreso.includes("_")) {
    delete partidas[m.chat]
    return conn.sendMessage(m.chat, { text: `🏆 ¡Ganaste! La palabra era *${partida.palabra}*` }, { quoted: m })
  }

  if (partida.intentos <= 0) {
    delete partidas[m.chat]
    return conn.sendMessage(m.chat, { text: `❌ Perdiste. La palabra era *${partida.palabra}*` }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { 
    text: `🎮 Arcado\n\n${partida.progreso.join(" ")}\n\n❌ Letras incorrectas: ${partida.letrasUsadas.filter(l => !partida.palabra.includes(l)).join(", ") || "-"}\n❤️ Intentos restantes: ${partida.intentos}` 
  }, { quoted: m })
}
