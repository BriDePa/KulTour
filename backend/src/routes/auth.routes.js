const express = require("express");
const { register, login, me, updateProfile, changePassword, deleteAccount, debugLogin, verifyRequest } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, me);
router.put("/profile", authenticate, updateProfile);
router.put("/password", authenticate, changePassword);
router.delete("/account", authenticate, deleteAccount);
router.post("/verify-request", authenticate, verifyRequest);

if (process.env.NODE_ENV !== "production") {
  router.get("/debug/login", debugLogin);
}

module.exports = router;