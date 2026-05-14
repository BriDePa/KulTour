const express = require("express");
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require("../controllers/favorites.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getFavorites);
router.post("/", authenticate, addFavorite);
router.get("/check", authenticate, checkFavorite);
router.delete("/:id", authenticate, removeFavorite);

module.exports = router;