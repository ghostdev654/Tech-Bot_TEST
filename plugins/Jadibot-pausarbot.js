import fs from 'fs'
import path from 'path'
import { yukiJadiBot } from './path_to_the_file_where_yukiJadiBot_is_exported.js' // Ajusta la ruta al archivo donde está exportada yukiJadiBot

let handler = async (m, { args }) => {
  if (args.length < 2) {
    return m.reply('Uso: .pausabot <número> <tiempo>\nEjemplo: .pausabot 57123456789 2h\nEl tiempo puede ser en horas (h) o minutos (m), máximo 6h.')
  }

  let number = args[0].replace(/[^0-9]/g, '')
  if (!number || number.length < 8) {
    return m.reply('Número inválido.')
  }

  let timeStr = args[1]
  let timeMs = parseTime(timeStr)
  if (isNaN(timeMs)) {
    return m.reply('Tiempo inválido. Usa formato como 2h o 30m.')
  }
  if (timeMs > 6 * 60 * 60 * 1000) {
    return m.reply('El máximo es 6 horas.')
  }
  if (timeMs < 60000) {
    return m.reply('El mínimo es 1 minuto.')
  }

  let subbotPath = path.join('./JadiBots', number)
  let credsPath = path.join(subbotPath, 'creds.json')
  if (!fs.existsSync(subbotPath) || !fs.existsSync(credsPath)) {
    return m.reply(`El número *${number}* no corresponde a un Subbot válido.`)
  }

  // Encontrar y cerrar la conexión actual
  let sock = global.conns.find(c => c.user?.jid?.startsWith(number + '@'))
  if (sock) {
    try {
      sock.ws.close()
    } catch {}
    sock.ev.removeAllListeners()
    let i = global.conns.indexOf(sock)
    if (i >= 0) {
      delete global.conns[i]
      global.conns.splice(i, 1)
    }
  }

  let suspendedDir = './SuspendedBots'
  if (!fs.existsSync(suspendedDir)) {
    fs.mkdirSync(suspendedDir)
  }
  let suspendedPath = path.join(suspendedDir, number)

  fs.renameSync(subbotPath, suspendedPath)

  m.reply(`✅ Subbot *${number}* pausado por ${timeStr}. Se resumirá automáticamente.`)

  setTimeout(async () => {
    fs.renameSync(suspendedPath, subbotPath)
    
    let options = {
      pathYukiJadiBot: subbotPath,
      m: null,
      conn: global.conn,
      args: [],
      usedPrefix: '.',
      command: 'qr',
      fromCommand: false
    }
    await yukiJadiBot(options)
    
    await global.conn.reply(m.chat, `✅ Subbot *${number}* resumido automáticamente.`, null)
  }, timeMs)
}

function parseTime(str) {
  let match = str.match(/^(\d+)([hm])?$/)
  if (!match) return NaN
  let num = parseInt(match[1])
  let unit = match[2] || 'm'
  return unit === 'h' ? num * 3600000 : num * 60000
}

handler.help = ['pausabot <número> <tiempo>']
handler.tags = ['serbot']
handler.command = ['pausabot']

export default handler
