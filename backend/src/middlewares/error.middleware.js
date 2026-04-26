const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Ya existe un registro con ese valor único",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Registro no encontrado",
    });
  }

  // Validation errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "JSON inválido en el cuerpo de la petición",
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
  });
};

module.exports = { errorHandler, notFound };
