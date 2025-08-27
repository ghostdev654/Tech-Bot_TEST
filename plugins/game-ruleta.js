const handler = async (m, { text, command, args }) => {
  if (!args.length) {
    return m.reply(`✍️ Usa el comando así:\n\n*.ruleta opción1 opción2 opción3 ...*\n\n> Máximo 10 opciones.`);
  }

  if (args.length > 10) {
    return m.reply('⚠️ Solo puedes poner hasta 10 opciones.');
  }

  // Elegir opción random
  let eleccion = args[Math.floor(Math.random() * args.length)];

  await m.reply(`🎰 *La ruleta ha girado...*\n\n👉 Resultado: *${eleccion}*`);
};

handler.command = ['ruleta'];
handler.tags = ['game']
handler.group = true

export default handler;
