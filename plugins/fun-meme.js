import axios from 'axios'

const handler = async (m, { conn }) => {
  try {
    const res = await axios.get('https://g-mini-ia.vercel.app/api/meme')
    const memeUrl = res.data.url

    if (!memeUrl) {
      return conn.sendMessage(m.chat, {
        text: '❌ No se pudo obtener el meme.'
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      image: { url: memeUrl },
      caption: `✳️ *Aqui tienes*`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: '⚠️ Hubo un error al intentar obtener el meme.'
    }, { quoted: m })
  }
}

handler.command = ['meme']
handler.help = ['meme']
handler.tags = ['fun']
export default handler
