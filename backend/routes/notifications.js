// backend/routes/notifications.js

const express = require("express");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

/**
 * 📌 通知関連ルート
 *
 * このルーターでは、ユーザーが受け取る通知の一覧取得や、
 * 通知の既読処理を行うためのエンドポイントを提供する。
 * すべての処理は Firebase 認証を通過したユーザーのみが利用可能。
 */

// ==============================
// 通知の一覧取得
// ==============================
// GET /api/notifications
// ログインユーザーに紐づく通知を全て取得する
router.get("/", verifyFirebaseToken, getNotifications);

// ==============================
// 通知を既読に更新
// ==============================
// PATCH /api/notifications/:id/read
// 特定の通知を既読状態に変更する
router.patch("/:id/read", verifyFirebaseToken, markAsRead);

module.exports = router;
