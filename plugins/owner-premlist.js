import fs from "fs";
import path from "path";

let handler = async (m, { conn }) => {
  const premiumPath = path.resolve("./json/premium.json");
  const expPath = path.resolve("./json/premium_exp.json");

  if (!fs.existsSync(premiumPath)) {
    return m.reply("⚠️ No existe el archivo premium.json");
  }

  let premiums = JSON.parse(fs.readFileSync(premiumPath));
  if (!Array.isArray(premiums) || premiums.length === 0) {
    return m.reply("📭 No hay usuarios premium actualmente.");
  }

  let expirations = {};
  if (fs.existsSync(expPath)) {
    expirations = JSON.parse(fs.readFileSync(expPath));
  }

  let lista = premiums.map((id, i) => {
    let jid = id + "@s.whatsapp.net";
    let exp = expirations[jid];

    if (exp) {
      let fecha = new Date(exp).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
      return `*${i + 1}.* wa.me/${id} ⏳ Expira: ${fecha}`;
    } else {
      return `*${i + 1}.* wa.me/${id} ⚡ Permanente`;
    }
  }).join("\n");

  m.reply(`✨ *Lista de usuarios Premium* ✨\n\n${lista}`);
};

handler.help = ["premlist"];
handler.tags = ["premium"];
handler.command = ["premlist"];
handler.rowner = true
export default handler;
