// backend/routes/activitiesRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");

// 🔐 認証ミドルウェアを適用
router.use(verifyFirebaseToken);

// --- ユーザーIDに紐づくアクティビティを取得 ---
// 例: /api/activities/user
router.get("/user", activityController.getActivitiesByUser);

// --- 全てのアクティビティを取得（管理者向け） ---
// 例: /api/activities/all
router.get("/all", activityController.getAllActivities);

// ✅ 特定の顧客に紐づく活動履歴を取得
// 例: /api/activities/customer/:customerId
router.get("/customer/:customerId", activityController.getActivitiesByCustomer);

// ✅ 特定の案件に紐づく活動履歴を取得 (新しいルート)
// 例: /api/activities/sales/:saleId
router.get("/sales/:saleId", activityController.getActivitiesBySaleId);

// ✅ 新規追加: 特定のタスクに紐づく活動履歴を取得
// 例: /api/activities/tasks/:taskId
router.get("/tasks/:taskId", activityController.getActivitiesByTask);

module.exports = router;
