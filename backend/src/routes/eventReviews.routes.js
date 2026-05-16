const express = require("express");
const {
  getEventReviews,
  createEventReview,
  updateEventReview,
  deleteEventReview,
  getMyEventReviews,
} = require("../controllers/eventReviews.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/events/:eventId/reviews", getEventReviews);
router.post("/events/:eventId/reviews", authenticate, createEventReview);
router.put("/reviews/:id", authenticate, updateEventReview);
router.delete("/reviews/:id", authenticate, deleteEventReview);
router.get("/reviews/my-events", authenticate, getMyEventReviews);

module.exports = router;