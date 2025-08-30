import fs from 'fs'
let file = './cerrados.json'
let cerrados = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

let iniciado = false // <-- bandera para no duplicar el intervalo

let handler = m => {
  if (!iniciado) {
    iniciado = true
    setInterval(async () => {
      let now = Date.now()
      for (let chat in cerrados) {
        if (now >= cerrados[chat]) {
          try {
            await global.conn.groupSettingUpdate(chat, 'not_announcement')
            await global.conn.sendMessage(chat, { text: '✅ El grupo se ha abierto automáticamente.' })
          } catch (e) {
            console.error('Error reabriendo grupo:', e)
          }
          delete cerrados[chat]
          fs.writeFileSync(file, JSON.stringify(cerrados, null, 2))
        }
      }
    }, 10_000) // revisa cada 10s
  }
}

handler.before = handler
export default handler
