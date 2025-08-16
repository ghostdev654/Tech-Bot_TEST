import fs from "fs";
import path from "path";

const premiumFile = path.join("./json/premium.json");
const premiumExpFile = path.join("./json/premium_exp.json");

let handler = async (m, { text }) => {
  if (!text) throw "⚠️ Usa: *.addprem <número> <días>*";

  let [num, dias] = text.split(" ");
  if (!num || !dias) throw "⚠️ Usa: *.addprem <número> <días>*";

  dias = parseInt(dias);
  if (isNaN(dias) || dias <= 0) throw "❌ Los días deben ser un número válido";

  // Archivos
  let prems = fs.existsSync(premiumFile) ? JSON.parse(fs.readFileSync(premiumFile)) : [];
  let expirations = fs.existsSync(premiumExpFile) ? JSON.parse(fs.readFileSync(premiumExpFile)) : {};

  // Calcular expiración
  const expDate = Date.now() + dias * 24 * 60 * 60 * 1000;

  // Agregar si no existe
  if (!prems.includes(num)) prems.push(num);
  expirations[num] = expDate;

  // Guardar
  fs.writeFileSync(premiumFile, JSON.stringify(prems, null, 2));
  fs.writeFileSync(premiumExpFile, JSON.stringify(expirations, null, 2));

  // Recargar global.prems
  global.prems = prems;

  m.reply(`✅ Número *${num}* ahora es premium por *${dias} días*`);
};

handler.command = ["+prem"];
handler.tags = ["owner"]
handler.rowner = true; // Solo owner
export default handler;
