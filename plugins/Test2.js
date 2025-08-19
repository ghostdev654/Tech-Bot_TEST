let handler = async (m, { sock }) => {
  // sock.user.id trae el jid del bot (ej: "1234567890@s.whatsapp.net")
  let jid = sock.user.id;
  let numero = jid.split("@")[0]; // solo el número

  await m.reply(`🤖 Este bot está usando el número: *${numero}*`);
};

handler.command = ["mibot", "botnum"];
hanlder.rowner = true
export default handler;
