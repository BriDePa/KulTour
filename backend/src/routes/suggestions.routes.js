const express = require("express");
const { getSuggestions } = require("../controllers/suggestions.controller");

const router = express.Router();

router.get("/", getSuggestions);

module.exports = router;
