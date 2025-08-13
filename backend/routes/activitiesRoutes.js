// backend/routes/activitiesRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware"); // 💡 修正: 分割代入で関数を直接インポート
const activityController = require("../controllers/activityController");

// 🔐 認証ミドルウェアを適用
router.use(verifyFirebaseToken); // 💡 修正: 正しい関数名を指定

// --- ユーザーIDに紐づくアクティビティを取得 ---
// 例: /api/activities/user
router.get("/user", activityController.getActivitiesByUser);

// --- 全てのアクティビティを取得（管理者向け） ---
// 例: /api/activities/all
router.get("/all", activityController.getAllActivities);

// --- 顧客IDに紐づくアクティビティを取得 ---
// 例: /api/activities/customer/:customerId
router.get("/customer/:customerId", activityController.getActivitiesByCustomer);

module.exports = router;
