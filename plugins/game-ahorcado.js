// ./plugins/arcado.js
let juegos = {} // partidas por chat+usuario

function getQuotedId(m) {
  return m?.quoted?.id || m?.quoted?.key?.id || m?.msg?.contextInfo?.stanzaId || null
}

let handler = async (m, { conn, args }) => {
  const chatId = m.chat
  const userId = m.sender
  const key = `${chatId}:${userId}`

  // Cancelar
  if ((args[0] || '').toLowerCase() === 'stop') {
    if (juegos[key]) {
      delete juegos[key]
      return m.reply('🛑 Juego cancelado.')
    }
    return m.reply('No tienes ningún juego activo aquí.')
  }

  // Ya hay juego para este user en este chat
  if (juegos[key]) {
    return m.reply('⚠️ Ya tienes un juego en curso en este chat. Responde al último mensaje del juego con UNA letra.')
  }

  const PALABRAS = ['PROGRAMADOR','DISCORD','JAVASCRIPT','ARGENTINA','ESCOLAR','WHATSAPP','ARCADE','MUSICA','BAILEYS','CHATGPT','MAGNESIO','AZUFRE','OXIGENO','HIERRO','HIDROXIDO','TRIOXIDO','NEUMATICA','HIDRAULICA','IODO','SABANAS','PERRO','GATO','CABALLO','RINOCERONTE','ALFOMBRA','CASA','COMPUTADORA','TELEFONO','NUMERO','RADIO','AURICULARES','CARGADOR','CABLE','RELOJ','ZAPATO','PAIS','PERUANO','ARGENTINO','BRASILERO','PELUCHE','HELICOPTERO','ELEFANTE','VELERO','ASPIRADORA','TELEVISION','UNIFORME','TECLADO','PENSAMIENTO','ALIMENTO','PARLANTE','MATE','CAFE','JUGO','JUEGO']
  const palabra = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]
  const progreso = Array.from({ length: palabra.length }, () => '_')
  const incorrectas = []
  const maxFallos = 6

  const txt = [
    `🎮 *AHORCADO INICIADO*\n> Juego de @${userId.split('@')[0]}’`,
    '',
    progreso.join(' '),
    '',
    `❌ Fallos: 0/0${maxFallos}`,
    'Letras incorrectas: -',
    '',
    '👉 *Responde a ESTE mensaje* con una sola letra (A-Z).\n\n> Usa *.ahorcado stop* para detener el juego.'
  ].join('\n')

  const sent = await conn.sendMessage(chatId, { text: txt, mentions: [userId] }, { quoted: m })

  juegos[key] = {
    palabra,
    progreso,
    incorrectas,
    fallos: 0,
    maxFallos,
    anchorId: sent?.key?.id || sent?.id || null
  }
}

handler.help = ['ahorcado']
handler.tags = ['game']
handler.command = ['ahorcado', 'arcado', 'aorcado']

// === LOOP: captura letras ===
handler.before = async (m, { conn }) => {
  const chatId = m.chat
  const userId = m.sender
  const key = `${chatId}:${userId}`
  const game = juegos[key]
  if (!game) return

  const quotedId = getQuotedId(m)
  if (!quotedId || quotedId !== game.anchorId) return

  let raw = (m.text || '').trim()
  if (!raw || raw.length !== 1) return
  const letra = raw.toUpperCase()

  if (!/^[A-ZÑ]$/.test(letra)) {
    return conn.sendMessage(chatId, { text: '❌ Envía *una sola letra* (A-Z).' }, { quoted: m })
  }

  if (game.progreso.includes(letra) || game.incorrectas.includes(letra)) {
    return conn.sendMessage(chatId, { text: `⚠️ La letra *${letra}* ya fue usada.` }, { quoted: m })
  }

  if (game.palabra.includes(letra)) {
    for (let i = 0; i < game.palabra.length; i++) {
      if (game.palabra[i] === letra) game.progreso[i] = letra
    }
  } else {
    game.incorrectas.push(letra)
    game.fallos++
  }

  if (!game.progreso.includes('_')) {
    await conn.sendMessage(chatId, { text: `🏆 *¡GANASTE @${userId.split('@')[0]}!* La palabra era: \n> *${game.palabra}*`, mentions: [userId] }, { quoted: m })
    delete juegos[key]
    return true
  }

  if (game.fallos >= game.maxFallos) {
    await conn.sendMessage(chatId, { text: `💀 *Perdiste @${userId.split('@')[0]}.* La palabra era: \n> *${game.palabra}*`, mentions: [userId] }, { quoted: m })
    delete juegos[key]
    return true
  }

  const H = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n========\n```'
  ][game.fallos]

  const status = [
    `🎮 *AHORCADO*\n> Juego de @${userId.split('@')[0]}’`,
    '',
    game.progreso.join(' '),
    '',
    `❌ Fallos: ${game.fallos}/${game.maxFallos}`,
    `Letras incorrectas: ${game.incorrectas.join(', ') || '-'}`,
    '',
    '👉 Responde *a este* mensaje con una letra.'
  ].join('\n')

  const sent = await conn.sendMessage(chatId, { text: `${H}\n${status}`, mentions: [userId] }, { quoted: m })
  game.anchorId = sent?.key?.id || sent?.id || game.anchorId
  return true
}

export default handler
