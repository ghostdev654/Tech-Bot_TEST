import fs from 'fs'
import path from 'path'

// Rutas a los archivos
const premsPath = path.join('./json/premium.json')
const expPath = path.join('./json/premium_exp.json')

// Función para cargar JSON de forma segura
function loadJSON(file, defaultValue) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return defaultValue
  }
}

// Cargar datos iniciales
let prems = loadJSON(premsPath, [])
let premiumExp = loadJSON(expPath, {})

// Guardar cambios
function saveFiles() {
  fs.writeFileSync(premsPath, JSON.stringify(prems, null, 2))
  fs.writeFileSync(expPath, JSON.stringify(premiumExp, null, 2))
