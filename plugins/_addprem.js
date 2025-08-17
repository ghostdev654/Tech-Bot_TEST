import fs from "fs";
import path from "path";

const premiumFile = path.resolve("./json/premium.json");
const expFile = path.resolve("./json/premium_exp.json");

// Función segura para leer JSON
function readJSON(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    let data = fs.readFileSync(file);
    return JSON.parse(data.toString() || JSON.stringify(def));
  } catch {
    return def;
  }
}

// Función segura para guardar JSON
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let handler = async (m, { args }) => {
  let numero = args[0]?.replace(/[@+]/g, ""); // limpio (sin @ ni +)
  let userJid = numero + "@s.whatsapp.net";
  let time = parseInt(args[1]) * 24 * 60 * 60 * 1000; // días → ms

  if (!numero || isNaN(time)) {
    return m.reply("⚠️ Uso: .addprem <número> <días>");
  }

  // premium.json = array de números limpios
  let premium = readJSON(premiumFile, []);
  // premium_exp.json = objeto con JID completo
  let premiumExp = readJSON(expFile, {});

  if (!premium.includes(numero)) premium.push(numero);

  let expireAt = Date.now() + time;
  premiumExp[userJid] = expireAt;

  saveJSON(premiumFile, premium);
  saveJSON(expFile, premiumExp);

  m.reply(`✅ ${numero} ahora es premium por ${args[1]} días`);
};

handler.help = ["+prem"];
handler.tags = ["owner"];
handler.command = ["+prem"];
handler.rowner = true;

export default handler;
