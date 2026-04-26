require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const os = require("os");

const authRoutes        = require("./routes/auth.routes");
const eventsRoutes      = require("./routes/events.routes");
const placesRoutes      = require("./routes/places.routes");
const suggestionsRoutes = require("./routes/suggestions.routes");
const citiesRoutes      = require("./routes/cities.routes");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app  = express();
const PORT = process.env.PORT || 4000;

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips  = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

// CORS: permite localhost Y cualquier IP de red local
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLAN = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d+\.\d+(:\d+)?$/.test(origin);
    const allowed = ["http://localhost:5173","http://localhost:4173", process.env.FRONTEND_URL].filter(Boolean);
    if (allowed.includes(origin) || isLAN) return callback(null, true);
    callback(null, true); // dev: permite todo
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "Kultour API", version: "1.0.0",
    timestamp: new Date().toISOString(), network: getLocalIPs() });
});

app.use("/api/auth",        authRoutes);
app.use("/api/events",      eventsRoutes);
app.use("/api/places",      placesRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/cities",      citiesRoutes);
app.use(notFound);
app.use(errorHandler);

// Escucha en todas las interfaces de red (0.0.0.0) para acceso LAN
app.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPs();
  console.log("\n🚀 Kultour API lista\n");
  console.log(`   localhost  → http://localhost:${PORT}`);
  ips.forEach(ip => console.log(`   red local  → http://${ip}:${PORT}  ← celular`));
  console.log(`\n   /health → http://localhost:${PORT}/health\n`);
});

module.exports = app;
