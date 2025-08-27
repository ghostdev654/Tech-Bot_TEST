import path from 'path'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fs from 'fs'
const premiumFile = './json/premium.json'

// Aseguramos archivo
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]), 'utf-8')

// Función de verificación
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0] // extraemos el numérico del JID
    return data.includes(botId)
  } catch {
    return false
  }
      }

async function addExif(webpSticker, packname, author) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: ['✨', '❀', '💫']
  }
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

let handler = async (m, { conn, text }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
                   }
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/webp/.test(mime)) return m.reply('✳️ *Uso Correcto:*\n➤ Responde a un sticker con el comando \`.wm\` para cambiarle el paquete al sticker.')

  let [packname, author] = text.split('|').map(v => v.trim())
  if (!packname) packname = 'Tech-Bot V1'
  if (!author) author = ''

  let media = await q.download()
  let buffer = await addExif(media, packname, author)
  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.help = ['wm']
handler.tags = ['sticker']
handler.command = ['wm', 'take', 'robarsticker']

export default handler
