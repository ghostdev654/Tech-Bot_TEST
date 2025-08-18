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

export function cleanPremiums() {
  let premium = readJSON(premiumFile, []);
  let premiumExp = readJSON(expFile, {});

  let now = Date.now();
  let nuevosPrem = [];
  for (let numero of premium) {
    let userJid = numero + "@s.whatsapp.net";
    if (premiumExp[userJid] && premiumExp[userJid] > now) {
      nuevosPrem.push(numero);
    } else {
      delete premiumExp[userJid]; // borrar expirado
    }
  }

  saveJSON(premiumFile, nuevosPrem);
  saveJSON(expFile, premiumExp);
  console.log("✅ Limpieza de premiums realizada");
}
