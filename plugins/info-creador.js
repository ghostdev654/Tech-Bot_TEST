let handler = async (m, { conn }) => {
const name = 'GhostDev.js'
const number = '5491151545427' // sin @
const email = 'clanxgamer@yahoo.com'
const org = 'Creador de TECH-BOT'
const note = 'Developer de bots'

const vcard = `
BEGIN:VCARD
VERSION:3.0
N:${name}
FN:${name}
ORG:${org}
EMAIL;type=EMAIL:${email}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
NOTE:${note}
END:VCARD
`.trim()

await conn.sendMessage(m.chat, {
contacts: {
displayName: name,
contacts: [{ vcard }],
},
}, { quoted: m })
await conn.sendMessage(m.chat, { text: `*Contacto del Creador\n\nSi tienes preguntas, duas o sugerenias sobre el funcionamiento de *Tech-Bot V1*, puedes contactar a mi crrador a continuación:\n\n📞 *Número:* ${number}\n👤 *Nombre* ${name}\n📩 *Correo:* ${email]\n\n> “Los bots no descansan, pero yo sí, así que no me andes mandando mensaje a las 3am porque no te voy a contestar…”\n- ${name}` }, { quoted: m })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'owner', 'creator']

export default handler
