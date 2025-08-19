let handler = async (m, { conn, text, args }) => {
  if (!args[0]) return m.reply("⚠️ Ingresa el número.\n\nEj: *.add 5491151545427*");

  let number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  try {
    await conn.groupParticipantsUpdate(m.chat, [number], "add");
    m.reply(`✅ Usuario agregado: @${args[0]}`, null, { mentions: [number] });
  } catch (e) {
    console.error(e);
    if (String(e).includes("not-authorized")) {
      m.reply("❌ No se pudo agregar al usuario.\nTiene restringido que lo añadan a grupos.");
    } else {
      m.reply("⚠️ Ocurrió un error inesperado al intentar agregar.");
    }
  }
};

handler.command = ["add", "añadir"];
handler.tags = ["gruop"]
handler.help = ["add <numero>"]
handler.admin = true; // solo admins del grupo
handler.group = true; // solo en grupos

export default handler;
