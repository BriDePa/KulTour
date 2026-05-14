#!/usr/bin/env node
/**
 * setup-network.js
 * Detecta la IP local de tu laptop y actualiza el .env del frontend
 * automáticamente para que el celular pueda conectarse.
 *
 * Uso: node setup-network.js
 */

const os   = require("os");
const fs   = require("fs");
const path = require("path");

const FRONTEND_ENV = path.join(__dirname, "frontend/.env");

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips  = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push({ name, address: net.address });
      }
    }
  }
  return ips;
}

const ips = getLocalIPs();

if (ips.length === 0) {
  console.error("❌ No se encontraron IPs de red. ¿Estás conectado a WiFi?");
  process.exit(1);
}

console.log("\n📡 Interfaces de red encontradas:\n");
ips.forEach((ip, i) => {
  console.log(`   [${i + 1}] ${ip.name.padEnd(20)} → ${ip.address}`);
});

// Usar la primera IP disponible (generalmente la WiFi)
const selectedIP = ips[0].address;

const envContent = `VITE_API_URL=http://${selectedIP}:4000/api
VITE_APP_NAME=Kultour
VITE_APP_ENV=development
# IP detectada automáticamente por setup-network.js
# Laptop IP: ${selectedIP}
`;

fs.writeFileSync(FRONTEND_ENV, envContent);

console.log(`
✅ .env del frontend actualizado con IP: ${selectedIP}

📱 Instrucciones para conectar el celular:
   1. Asegúrate que laptop y celular estén en el mismo WiFi
   2. Inicia el backend:   cd backend && npm run dev
   3. Inicia el frontend:  cd frontend && npm run dev
   4. En el celular abre:  http://${selectedIP}:5173

   (o ejecuta "npm run dev:network" en el frontend para ver la URL exacta)

🔒 Firewall: si no conecta, permite el puerto 4000 y 5173 en tu firewall.
   Windows: busca "Firewall de Windows" → Reglas de entrada → Nuevo → Puerto
   Linux:   sudo ufw allow 4000 && sudo ufw allow 5173
   macOS:   usualmente no bloquea en red local
`);
