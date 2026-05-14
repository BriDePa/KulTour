const os = require("os");
const http = require("http");

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push({ name, address: net.address, netmask: net.netmask });
      }
    }
  }
  return ips;
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, method: "HEAD", timeout: 2000 }, (res) => {
      resolve({ available: false, status: res.statusCode });
    });
    req.on("error", () => resolve({ available: true }));
    req.on("timeout", () => resolve({ available: true }));
  });
}

async function setupNetwork() {
  console.log("\n🌐 Configuración de Red - Kultour\n");
  console.log("=".repeat(50));

  const ips = getLocalIPs();
  console.log("\n📡 Interfaces de red detectados:");
  
  if (ips.length === 0) {
    console.log("   No se encontraron interfaces IPv4");
  } else {
    ips.forEach((ip, i) => {
      console.log(`   ${i + 1}. ${ip.name}: ${ip.address}`);
    });
  }

  const port = process.env.PORT || 4000;
  console.log(`\n📋 Puerto configurado: ${port}`);

  console.log("\n🔍 Verificando disponibilidad del puerto...");
  for (const ip of ips) {
    const result = await checkPort(ip.address, port);
    const status = result.available ? "✓ Disponible" : `⚠ En uso (HTTP ${result.status})`;
    console.log(`   ${ip.address}:${port} - ${status}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📝 Instrucciones de acceso:\n");
  console.log("   Servidor local:");
  console.log(`   → http://localhost:${port}`);
  console.log(`   → http://127.0.0.1:${port}`);

  if (ips.length > 0) {
    console.log("\n   Acceso desde dispositivos en la red local:");
    ips.forEach((ip) => {
      console.log(`   → http://${ip.address}:${port}`);
    });
  }

  console.log("\n   Para acceder desde celular:");
  console.log("   1. Conecta el celular a la misma red WiFi");
  console.log("   2. Usa la IP local mostrada arriba");
  console.log("   3. Asegúrate de que el firewall permite conexiones entrantes");

  console.log("\n" + "=".repeat(50));
  console.log("\n💡 Comandos útiles:\n");
  console.log("   Iniciar servidor: npm run dev");
  console.log("   Verificar estado: curl http://localhost:${port}/health");
  console.log("\n");
}

if (require.main === module) {
  setupNetwork().catch(console.error);
}

module.exports = { setupNetwork, getLocalIPs };