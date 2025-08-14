const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = `
╭━━━━➤〔 🤖 *TECH-BOT* 🤖 〕
┃
┃ 🚀 Convierte tu número en un 
┃ *Sub-Bot Temporal* y controla el bot 
┃ 
╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 *Pasos para vincular:*
┌ 1️⃣  Abre WhatsApp y toca los *⋮ tres*
│ *puntos* (arriba derecha)
├ 2️⃣  Pulsa en *Dispositivos*
│ *vinculados*
├ 3️⃣  Selecciona *Vincular con QR*
└ 4️⃣  Escanea el *código QR*.

> Powered by: *Tech-Bot Team*`.trim()

let rtx2 = `╭━━━━➤〔 🤖 *TECH-BOT* 🤖 〕
┃
┃ 🚀 Convierte tu número en un 
┃ *Sub-Bot Temporal* y controla el bot 
┃ 
╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 *Pasos para vincular:*
┌ 1️⃣  Abre WhatsApp y toca los *⋮ tres*
│ *puntos* (arriba derecha)
├ 2️⃣  Pulsa en *Dispositivos*
│ *vinculados*
├ 3️⃣  Selecciona *Vincular con el*
│ *número de teléfono*
└ 4️⃣  Ingresa el *código* para iniciar sesión con el bot.

> Powered by: *Tech-Bot Team*`.trim()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {

let time = global.db.data.users[m.sender].Subs + 120000

const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 30) {
return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)
}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id
let phoneNumber
let isFromButton = false

if (command === 'on_qr' || command === 'on_code') {
  isFromButton = true
  phoneNumber = args[0]
}

if (command === 'on_qr') {
  command = 'serqr'
}

if (command === 'on_code') {
  command = 'sercode'
}

if (command === 'sercode') {
  if (!isFromButton) {
    if (!args[0]) return m.reply('*_Ejemplo:_*' + usedPrefix + command + ' 57123456789')
    phoneNumber = args[0].replace(/[^0-9]/g, '')
    if (phoneNumber.length < 8) return m.reply('❌ *Número de teléfono inválido.*')
    const [result] = await conn.onWhatsApp(phoneNumber)
    if (!result || !result.exists) return m.reply('❌ *El número no está registrado en WhatsApp.*')
  }
  id = phoneNumber

  if (!isFromButton) {
    let jid = phoneNumber + '@s.whatsapp.net'
    let v
    try {
      v = await conn.getBusinessProfile(jid)
    } catch {
      v = null
    }
    let isBusinessNumber = !!v

    if (!isBusinessNumber) {
      const buttons = [
        { buttonId: `${usedPrefix}on_qr ${phoneNumber}`, buttonText: { displayText: 'Escanear QR' }, type: 1 },
        { buttonId: `${usedPrefix}on_code ${phoneNumber}`, buttonText: { displayText: 'Código de 8 dígitos' }, type: 1 }
      ];
      const buttonMessage = {
        text: 'Elige el método de vinculación:',
        footer: 'Powered by: *Tech-Bot Team*',
        buttons: buttons,
        headerType: 1
      };
      await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
      return;
    }
  }
} else {
  id = `${who.split`@`[0]}`
  phoneNumber = null // Para QR, no usar phoneNumber
}

let pathYukiJadiBot = path.join(`./${jadi}/`, id)
if (!fs.existsSync(pathYukiJadiBot)){
fs.mkdirSync(pathYukiJadiBot, { recursive: true })
}
yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
yukiJBOptions.m = m
yukiJBOptions.conn = conn
yukiJBOptions.args = args
yukiJBOptions.usedPrefix = usedPrefix
yukiJBOptions.command = command
yukiJBOptions.fromCommand = true
yukiJBOptions.phoneNumber = phoneNumber
yukiJadiBot(yukiJBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.help = ['serqr', 'sercode']
handler.tags = ['other']
handler.command = ['serqr', 'sercode', 'on_qr', 'on_code']
export default handler 

export async function yukiJadiBot(options) {
let { pathYukiJadiBot, m, conn, args, usedPrefix, command, phoneNumber } = options
if (command === 'sercode') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args
