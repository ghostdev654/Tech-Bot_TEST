let handler = async (m, { conn }) => {
  
  let link = await conn.groupInviteCode(m.chat)
  m.reply(`✨ *ACTIVACIÓN DE PREMIUM*\n\n> Con el sistema premium tendrás muchos más beneficios: Descargas ilimitadas, Descargas de pinterest, acceso a funciones premium, ¡Y muchas cosas mas!\n\n\n*Actívalo desde aquí:*\n\n✳️ *PayPal:*\nhttps:\/\/www.paypal.me\/clanXgamer\n\n\n👤 *Contacto:*\nwa.me\/5491151545427 (Owner)`)
}

handler.help = ['buyprem']
handler.tags = ['jadibot']
handler.command = ['comprarpremium', 'buyprem']

export default handler
