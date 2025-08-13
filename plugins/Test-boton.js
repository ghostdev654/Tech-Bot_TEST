// Agrega esto en tu handler de comandos
let handler = async (m, { conn }) => {
  const buttons = [
    { buttonId: 'id1', buttonText: { displayText: 'Botón 1' }, type: 1 },
    { buttonId: 'id2', buttonText: { displayText: 'Botón 2' }, type: 1 },
    { buttonId: 'id3', buttonText: { displayText: 'Botón 3' }, type: 1 }
  ];

  const buttonMessage = {
    text: "¡Hola! Este es un mensaje de prueba con botones.",
    footer: 'Prueba de Baileys',
    buttons: buttons,
    headerType: 1
  };

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
};

handler.command = ['testbotones'];
handler.help = ['testbotones'];
handler.tags = ['test'];

export default handler;
