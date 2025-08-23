import fs from 'fs'

let partidasTateti = {}

let handler = async (m, { conn, args }) => {
  let id = m.chat

  if (!partidasTateti[id]) {
    // Crear nueva partida
    if (!m.mentionedJid[0]) return m.reply('Debes mencionar a un jugador para iniciar el ta-te-ti.')
    let playerX = m.sender
    let playerO = m.mentionedJid[0]

    partidasTateti[id] = {
      board: Array(9).fill(null), // tablero
      turn: playerX,
      players: { X: playerX, O: playerO },
      symbols: { [playerX]: '❌', [playerO]: '⭕' }
    }

    conn.reply(id, renderBoard(partidasTateti[id].board) + `\n\nTurno de: @${playerX.split('@')[0]}`, m, { mentions: [playerX] })
  } else {
    m.reply('Ya hay una partida en curso en este chat. Termínenla antes de empezar otra.')
  }
}

handler.before = async (m, { conn }) => {
  let id = m.chat
  let partida = partidasTateti[id]
  if (!partida) return

  let player = m.sender
  if (player !== partida.turn) return // No es tu turno
  let move = parseInt(m.text.trim())
  if (isNaN(move) || move < 1 || move > 9) return

  move = move - 1
  if (partida.board[move]) {
    return conn.reply(id, 'Esa casilla ya está ocupada.', m)
  }

  partida.board[move] = partida.symbols[player]

  // Revisar victoria
  if (checkWin(partida.board, partida.symbols[player])) {
    conn.reply(id, renderBoard(partida.board) + `\n\n¡Ganó @${player.split('@')[0]}! 🎉`, m, { mentions: [player] })
    delete partidasTateti[id]
    return
  }

  // Revisar empate
  if (partida.board.every(cell => cell)) {
    conn.reply(id, renderBoard(partida.board) + `\n\n¡Empate! 🤝`, m)
    delete partidasTateti[id]
    return
  }

  // Cambiar turno
  partida.turn = player === partida.players.X ? partida.players.O : partida.players.X
  conn.reply(id, renderBoard(partida.board) + `\n\nTurno de: @${partida.turn.split('@')[0]}`, m, { mentions: [partida.turn] })
}

handler.command = /^tateti$/i
export default handler

function renderBoard(board) {
  return `
${renderCell(board[0], 1)} | ${renderCell(board[1], 2)} | ${renderCell(board[2], 3)}
---------
${renderCell(board[3], 4)} | ${renderCell(board[4], 5)} | ${renderCell(board[5], 6)}
---------
${renderCell(board[6], 7)} | ${renderCell(board[7], 8)} | ${renderCell(board[8], 9)}
  `
}

function renderCell(cell, number) {
  return cell ? cell : number
}

function checkWin(board, symbol) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // filas
    [0,3,6], [1,4,7], [2,5,8], // columnas
    [0,4,8], [2,4,6]           // diagonales
  ]
  return lines.some(([a,b,c]) => board[a] === symbol && board[b] === symbol && board[c] === symbol)
}
