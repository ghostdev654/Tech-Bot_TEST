import { xpRange } from '../lib/levelling.js'

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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `❎ Debes indicar una categoría.\n\nEjemplo:\n${usedPrefix + command} info`, m)
  }

  const category = args[0].toLowerCase()
  if (!tags[category]) {
    return conn.reply(m.chat, `❎ Categoría no encontrada.\n\nCategorías disponibles:\n${Object.keys(tags).join(', ')}`, m)
  }

  // Filtrar los comandos que tienen el tag seleccionado
  const help = Object.values(global.plugins)
    .filter(p => !p.disabled)
    .map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium,
    }))

  const commandsInCategory = help.filter(menu => menu.tags?.includes(category))

  if (!commandsInCategory.length) {
    return conn.reply(m.chat, `⚠️ No hay comandos en la categoría *${tags[category]}*`, m)
  }

  let text = `📂 *Categoría:* ${tags[category]}\n\n`

  for (let cmd of commandsInCategory) {
    for (let h of cmd.help) {
      text += `- ${cmd.prefix ? h : `${usedPrefix}${h}`} ${cmd.limit ? '⭐' : ''} ${cmd.premium ? '🪪' : ''}\n`
    }
  }

  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.command = ["category"]
handler.tags = ["tools"]
export default handler
