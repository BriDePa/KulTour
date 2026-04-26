#!/usr/bin/env node
/**
 * generate-icons.js
 * Genera todos los íconos PWA de Kultour sin necesidad de diseño externo.
 * Ejecutar: node generate-icons.js
 * Requiere: npm install canvas (solo para este script)
 */

const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "../public");
const ICONS_DIR  = path.join(PUBLIC_DIR, "icons");
const SHOTS_DIR  = path.join(PUBLIC_DIR, "screenshots");

// Crear carpetas si no existen
[ICONS_DIR, SHOTS_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ─── SVG base del ícono ────────────────────────────────────
// Ícono: brújula Kultour con gradiente azul → verde
function buildIconSVG(size) {
  const r = Math.round(size * 0.22); // border-radius
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A4FFF"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.8)"/>
    </linearGradient>
  </defs>
  <!-- Fondo redondeado -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <!-- Brújula: círculo exterior -->
  <circle
    cx="${size / 2}" cy="${size / 2}"
    r="${size * 0.32}"
    fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="${size * 0.025}"
  />
  <!-- Aguja norte (blanca) -->
  <polygon
    points="${size/2},${size*0.22} ${size*0.565},${size*0.52} ${size/2},${size*0.46} ${size*0.435},${size*0.52}"
    fill="white"
  />
  <!-- Aguja sur (semitransparente) -->
  <polygon
    points="${size/2},${size*0.78} ${size*0.565},${size*0.48} ${size/2},${size*0.54} ${size*0.435},${size*0.48}"
    fill="rgba(255,255,255,0.45)"
  />
  <!-- Punto central -->
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.04}" fill="white"/>
</svg>`;
}

// ─── Favicon SVG ──────────────────────────────────────────
const faviconSVG = buildIconSVG(32);
fs.writeFileSync(path.join(ICONS_DIR, "favicon.svg"), faviconSVG);
console.log("✅ favicon.svg generado");

// ─── Íconos en todos los tamaños ──────────────────────────
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach((size) => {
  const svg = buildIconSVG(size);
  const filename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(ICONS_DIR, filename), svg);
  console.log(`✅ ${filename} generado`);
});

// ─── Nota sobre PNG ───────────────────────────────────────
// Para convertir SVG → PNG (requerido para algunos dispositivos):
// opción A: npm install sharp  → usar sharp para convertir
// opción B: Subir a realfavicongenerator.net o squoosh.app
// opción C: La mayoría de navegadores modernos aceptan SVG como ícono de manifest

console.log(`
📱 Íconos SVG generados en /public/icons/

Para convertir a PNG (necesario para iOS):
  opción 1: npx svg2png-many public/icons/*.svg
  opción 2: Usar https://www.pwabuilder.com/imageGenerator
            (sube el icon-512.svg, descarga el paquete completo)

Mientras tanto, los SVG funcionan perfectamente en Android Chrome.
`);
