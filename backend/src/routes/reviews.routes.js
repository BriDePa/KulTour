const express = require("express");
const { getReviewsByPlace, createReview, updateReview, deleteReview, getMyReviews } = require("../controllers/reviews.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/place/:placeId", getReviewsByPlace);
router.get("/me", authenticate, getMyReviews);
router.post("/", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;