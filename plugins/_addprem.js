import fs from "fs";
import path from "path";

const premiumFile = path.resolve("./json/premium.json");
const expFile = path.resolve("./json/premium_exp.json");

// Función segura para leer JSON
function readJSON(file) {
  try {
    if (!fs.existsSync(file)) return {};
    let data = fs.readFileSync(file);
    return JSON.parse(data.toString() || "{}");
  } catch {
    return {}; // fallback si hay error
  }
}

// Función segura para guardar JSON
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn, args }) => {
  let user = args[0]?.replace(/[@+]/g, "") + "@s.whatsapp.net";
  let days = parseInt(args[1]); // número de días
  let time = days * 24 * 60 * 60 * 1000; // días → ms

  if (!user || isNaN(days)) {
    return m.reply("⚠️ Uso: .addprem <número> <días>");
  }

  let premium = readJSON(premiumFile);
  let premiumExp = readJSON(expFile);

  // Guardar usuario en la lista premium
  if (!premium.users) premium.users = [];
  if (!premium.users.includes(user)) premium.users.push(user);

  // Guardar fecha de expiración
  let expireAt = Date.now() + time;
  premiumExp[user] = expireAt;

  saveJSON(premiumFile, premium);
  saveJSON(expFile, premiumExp);

  m.reply(`✅ ${user} ahora es premium por ${days} día(s)`);
};

handler.help = ["+prem"];
handler.tags = ["owner"];
handler.command = ["+prem"];
handler.rowner = true;

export default handler;
