const express = require("express");
const { uploadImage, uploadMultiple } = require("../controllers/upload.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { upload, handleUploadError } = require("../middlewares/upload");
const { uploadLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/", authenticate, uploadLimiter, upload.single("image"), handleUploadError, uploadImage);
router.post("/multiple", authenticate, uploadLimiter, upload.array("images", 5), handleUploadError, uploadMultiple);

module.exports = router;