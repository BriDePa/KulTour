const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
} = require("../controllers/events.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/:id", getEventById);
router.post("/", authenticate, authorize("ORGANIZER", "ADMIN"), createEvent);
router.put("/:id", authenticate, authorize("ORGANIZER", "ADMIN"), updateEvent);
router.delete("/:id", authenticate, authorize("ORGANIZER", "ADMIN"), deleteEvent);

module.exports = router;
