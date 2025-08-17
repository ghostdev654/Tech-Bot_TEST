import fs from "fs";
import path from "path";

const premiumFile = path.resolve("./json/premium.json");
const expFile = path.resolve("./json/premium_exp.json");

function readJSON(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    let data = fs.readFileSync(file);
    return JSON.parse(data.toString() || JSON.stringify(def));
  } catch {
    return def;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let handler = async (m, { args }) => {
  let numero = args[0]?.replace(/[@+]/g, "");
  if (!numero) return m.reply("⚠️ Uso: .delprem <número>");

  let userJid = numero + "@s.whatsapp.net";

  let premium = readJSON(premiumFile, []);
  let premiumExp = readJSON(expFile, {});

  // eliminar del array
  premium = premium.filter(n => n !== numero);

  // eliminar del exp
  if (premiumExp[userJid]) delete premiumExp[userJid];

  saveJSON(premiumFile, premium);
  saveJSON(expFile, premiumExp);

  m.reply(`❌ ${numero} ya no es premium`);
};

handler.help = ["-prem"];
handler.tags = ["owner"];
handler.command = ["-prem"];
handler.rowner = true;

export default handler;
