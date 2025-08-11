import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['5491151545427', 'ghostdev.js', true],
  ['573133374132', 'yo soy yo', true]
]

global.mods = []
global.prems = []

global.namebot = '𝙏𝙚𝙘𝙝-𝘽𝙤𝙩 ⱽ¹'
global.packname = '𝙏𝙚𝙘𝙝-𝘽𝙤𝙩 ⱽ¹'
global.author = '✨ Build By: Ado ✨'
global.moneda = 'coind'

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.sessions = 'Sessions'
global.jadi = 'JadiBots'
global.yukiJadibts = true

global.namecanal = '❇️'
global.idcanal = ''
global.idcanal2 = ''
global.canal = ''
global.canalreg = ''

global.ch = {
  ch1: ''
}

global.multiplier = 69
global.maxwarn = '3'



let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 Se actualizó 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
