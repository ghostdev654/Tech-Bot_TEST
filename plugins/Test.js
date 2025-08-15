// test.js
const tags = {
  serbot: '🌐 SUBBOTS',
  info: 'ℹ️ INFORMACIÓN',
  downloader: '⬇️ DESCARGAS',
  tools: '🛠️ HERRAMIENTAS',
  ia: '🤖 IA',
  owner: '👑 PROPIETARIO',
  game: '🎮 JUEGOS',
  group: '👥 GRUPOS',
  gacha: '🎲 GACHA ANIME',
  reacciones: '💕 ANIME REACCIONES',
  eco: '💸 ECONOMÍA',
  search: '🔎 BUSCADORES',
  sticker: '📌 STICKERS',
  channel: '📺 CANALES',
  fun: '😂 DIVERSIÓN',
}

let handler = async (m, { conn }) => {
  const sections = [
    {
      title: "📂 Categorías disponibles",
      rows: Object.keys(tags).map(tag => ({
        title: tags[tag],
        rowId: `#category ${tag}`,
        description: `Ver comandos de ${tags[tag]}`
      }))
    }
  ]

  await conn.sendMessage(m.chat, {
    text: "📋 Selecciona una categoría para ver sus comandos:",
    footer: "Menú de categorías",
    buttonText: "Ver categorías",
    sections
  }, { quoted: m })
}

handler.command = ["test_"]
export default handler
