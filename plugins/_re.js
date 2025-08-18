import fs from "fs";
import path from "path";

const restrPath = path.resolve("./json/restringidos.json");

// Creamos archivo si no existe
if (!fs.existsSync(restrPath)) {
  fs.writeFileSync(restrPath, JSON.stringify([]));
}

// 🔹 Middleware: verificamos restricción ANTES de ejecutar
export async function before(m, { command, isOwner }) {
  let restringidos = JSON.parse(fs.readFileSync(restrPath));

  if (restringidos.includes(command) && !isOwner) {
    m.reply(`🚫 El comando *${command}* está bloqueado por el Owner.`);
    return true; // corta la ejecución del comando
  }
  return false;
}

let handler = async (m, { text, isOwner }) => {
  if (!isOwner) return m.reply("⚠️ Solo el Owner puede usar este comando.");

  if (!text) {
    let lista = JSON.parse(fs.readFileSync(restrPath));
    if (!lista.length) return m.reply("✅ No hay comandos restringidos.");
    return m.reply("🚫 Comandos restringidos:\n\n" + lista.map(c => `• ${c}`).join("\n"));
  }

  let restringidos = JSON.parse(fs.readFileSync(restrPath));
  let cmd = text.toLowerCase();

  if (restringidos.includes(cmd)) {
    restringidos = restringidos.filter(c => c !== cmd);
    m.reply(`✅ El comando *${cmd}* fue desbloqueado.`);
  } else {
    restringidos.push(cmd);
    m.reply(`🚫 El comando *${cmd}* fue bloqueado para todos.`);
  }

  fs.writeFileSync(restrPath, JSON.stringify(restringidos, null, 2));
};

handler.help = ["re <comando>"];
handler.tags = ["owner"];
handler.command = /^re$/i;

export default handler;
