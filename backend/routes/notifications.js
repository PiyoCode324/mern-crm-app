// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  getNotifications,
  addNotification,
  markAsRead,
} = require("../controllers/notificationController");

router.use(verifyFirebaseToken);

router.get("/", getNotifications);
router.post("/", addNotification);
router.patch("/:id/read", markAsRead);

module.exports = router;
