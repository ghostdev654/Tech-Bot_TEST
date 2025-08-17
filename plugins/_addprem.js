import fs from "fs";

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) throw "Solo el *Owner* puede usar este comando.";
  if (args.length < 2) throw "Uso: *.addprem <número> <días>*";

  let number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  let days = parseInt(args[1]);
  if (isNaN(days) || days <= 0) throw "Los días deben ser un número mayor a 0.";

  // Leer premium.json
  let premiumFile = "./json/premium.json";
  let premium = JSON.parse(fs.readFileSync(premiumFile));

  // Leer expiraciones
  let expFile = "./json/premium_exp.json";
  let expirations = JSON.parse(fs.readFileSync(expFile));

  // Si no está en la lista, lo agrega
  if (!premium.includes(number)) {
    premium.push(number);
    fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
  }

  // Guardar expiración
  let expireAt = Date.now() + days * 24 * 60 * 60 * 1000;
  expirations[number] = expireAt;
  fs.writeFileSync(expFile, JSON.stringify(expirations, null, 2));

  // Actualizar global.prems
  global.prems = premium;

  m.reply(`✅ ${number} ahora es *Premium* por ${days} días.`);
};

handler.command = ["addprem"];
handler.owner = true;

export default handler;
