const rateLimit = require("express-rate-limit");

const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Por favor espera un minuto antes de intentarlo de nuevo.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"] || "unknown";
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Demasiados intentos de autenticación. Por favor espera un minuto antes de intentarlo de nuevo.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Demasiadas búsquedas. Por favor espera un minuto antes de buscar de nuevo.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Demasiadas cargas de archivos. Por favor espera un minuto antes de subir otro archivo.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  standardLimiter,
  authLimiter,
  searchLimiter,
  uploadLimiter,
};