import fs from 'fs'

let handler = async (m, { args }) => {
  if (!args[0]) return m.reply("📌 Uso: setprimary <número con @s.whatsapp.net>")

  let db = JSON.parse(fs.readFileSync('./json/primary.json'))
  if (!db[m.chat]) db[m.chat] = { number: null, subbots: false }

  db[m.chat].number = args[0]
  fs.writeFileSync('./json/primary.json', JSON.stringify(db, null, 2))

  m.reply(`✅ Número primario configurado en este grupo: ${args[0]}`)
}
handler.command = ['setprimary']
handler.group = true
handler.admin = true
handler.group = true

export default handler
