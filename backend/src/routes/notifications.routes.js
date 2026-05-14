const express = require("express");
const { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } = require("../controllers/notifications.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.post("/", authenticate, authorize("ADMIN"), createNotification);
router.put("/read-all", authenticate, markAllAsRead);
router.put("/:id/read", authenticate, markAsRead);
router.delete("/:id", authenticate, deleteNotification);

module.exports = router;