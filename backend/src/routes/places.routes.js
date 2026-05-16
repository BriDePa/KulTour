const express = require("express");
const {
  getPlaces,
  getPlaceById,
  createPlace,
  getFeaturedPlaces,
  updatePlace,
} = require("../controllers/places.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getPlaces);
router.get("/featured", getFeaturedPlaces);
router.get("/:id", getPlaceById);
router.post("/", authenticate, authorize("ORGANIZER", "ADMIN"), createPlace);
router.put("/:id", authenticate, authorize("ORGANIZER", "ADMIN"), updatePlace);

module.exports = router;
