// ./plugins/arcado.js
let juegos = {} // partidas por chat

function getQuotedId(m) {
  // Robusto entre distintas versiones
  return m?.quoted?.id || m?.quoted?.key?.id || m?.msg?.contextInfo?.stanzaId || null
}

let handler = async (m, { conn, args, command }) => {
  // .arcado -> inicia juego
  const chatId = m.chat

  // Opcional: .arcado stop para cancelar
  if ((args[0] || '').toLowerCase() === 'stop') {
    if (juegos[chatId]) {
      delete juegos[chatId]
      return m.reply('🛑 Juego cancelado.')
    }
    return m.reply('No hay juego activo.')
  }

  if (juegos[chatId]) {
    return m.reply('⚠️ Ya hay un juego en curso en este chat. Responde al último mensaje del juego con UNA letra.')
  }

  const PALABRAS = ['PROGRAMADOR','DISCORD','JAVASCRIPT','ARGENTINA','ESCOLAR','WHATSAPP','ARCADE','MUSICA','BAILEYS','CHATGPT','MAGNESIO','AZUFRE','OXIGENO','HIERRO','HIDROXIDO','TRIOXIDO','NEUMATICA','HIDRAULICA','IODO','SABANAS','PERRO','GATO','CABALLO','RINOCERONTE','ALFOMBRA','CASA','COMPUTADORA','TELEFONO','NUMERO','RADIO','AURICULARES','CARGADOR','CABLE','RELOJ','ZAPATO','PAIS','PERUANO','ARGENTINO','BRASILERO','PELUCHE','HELICOPTERO','ELEFANTE','VELERO','ASPIRADORA','TELEVISION','UNIFORME','TECLADO','PENSAMIENTO','ALIMENTO','COMPUTADORA','PARLANTE','MATE','CAFE','JUGO','JUEGO']
  const palabra = PALABRAS[Math.floor(Math.random() * PALABRAS.length)] // SIEMPRE MAYÚSCULAS
  const progreso = Array.from({ length: palabra.length }, () => '_')
  const incorrectas = []
  const maxFallos = 6

  // enviar primer estado y guardar el id para que solo cuenten replies a ese mensaje
  const txt = [
    '🎮 *AHORCADO INICIADO*',
    '',
    progreso.join(' '),
    '',
    `❌ Fallos: 0/0${maxFallos}`,
    'Letras incorrectas: -',
    '',
    '👉 *Responde a ESTE mensaje* con una sola letra (A-Z).'
  ].join('\n')

  const sent = await conn.sendMessage(chatId, { text: txt }, { quoted: m })

  juegos[chatId] = {
    palabra,              // p.ej. "ARGENTINA"
    progreso,             // ['_','_','_','_','_','_','_','_','_']
    incorrectas,          // ['B','C',...]
    fallos: 0,
    maxFallos,
    anchorId: sent?.key?.id || sent?.id || null // el mensaje que deben responder
  }
}

handler.help = ['ahorcado']
handler.tags = ['game']
handler.command = ['ahorcado', 'arcado', 'aorcado']

// === LOOP: captura letras respondiendo al mensaje del juego ===
handler.before = async (m, { conn }) => {
  const chatId = m.chat
  const game = juegos[chatId]
  if (!game) return

  // Debe ser respuesta al último estado del juego
  const quotedId = getQuotedId(m)
  if (!quotedId || quotedId !== game.anchorId) return

  // Debe traer texto de UNA letra
  let raw = (m.text || '').trim()
  if (!raw || raw.length !== 1) return
  // aceptar mayúsculas/minúsculas — normalizamos a MAYÚSCULAS
  const letra = raw.toUpperCase()

  // Validar letra (A-Z + Ñ)
  if (!/^[A-ZÑ]$/.test(letra)) {
    return conn.sendMessage(chatId, { text: '❌ Envía *una sola letra* (A-Z).' }, { quoted: m })
  }

  // No repetir
  if (game.progreso.includes(letra) || game.incorrectas.includes(letra)) {
    return conn.sendMessage(chatId, { text: `⚠️ La letra *${letra}* ya fue usada.` }, { quoted: m })
  }

  // Procesar intento
  if (game.palabra.includes(letra)) {
    for (let i = 0; i < game.palabra.length; i++) {
      if (game.palabra[i] === letra) game.progreso[i] = letra
    }
  } else {
    game.incorrectas.push(letra)
    game.fallos++
  }

  // ¿ganó?
  if (!game.progreso.includes('_')) {
    await conn.sendMessage(chatId, { text: `🏆 *¡GANASTE!* La palabra era: \n> *${game.palabra}*` }, { quoted: m })
    delete juegos[chatId]
    return true
  }

  // ¿perdió?
  if (game.fallos >= game.maxFallos) {
    await conn.sendMessage(chatId, { text: `💀 *Perdiste.* La palabra era: \n> *${game.palabra}*` }, { quoted: m })
    delete juegos[chatId]
    return true
  }

  // Dibujito ASCII del ahorcado según fallos
  const H = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n========\n```'
  ][game.fallos]

  // Enviar nuevo estado y actualizar anchorId para el próximo reply
  const status = [
    '🎮 *AHORCADO*',
    '',
    game.progreso.join(' '),
    '',
    `❌ Fallos: ${game.fallos}/${game.maxFallos}`,
    `Letras incorrectas: ${game.incorrectas.join(', ') || '-'}`,
    '',
    '👉 Responde *a este* mensaje con una letra.'
  ].join('\n')

  const sent = await conn.sendMessage(chatId, { text: `${H}\n${status}` }, { quoted: m })
  game.anchorId = sent?.key?.id || sent?.id || game.anchorId
  return true
}

export default handler
