const { getFileUrl } = require("../middlewares/upload");

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ningún archivo",
      });
    }

    const fileUrl = getFileUrl(req.file.filename);

    res.status(201).json({
      success: true,
      message: "Archivo subido exitosamente",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ningún archivo",
      });
    }

    const files = req.files.map((file) => ({
      url: getFileUrl(file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(201).json({
      success: true,
      message: `${files.length} archivos subidos exitosamente`,
      data: { files },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, uploadMultiple };