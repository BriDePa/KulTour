const express = require("express");
const { globalSearch } = require("../controllers/search.controller");
const { searchLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.get("/", searchLimiter, globalSearch);

module.exports = router;