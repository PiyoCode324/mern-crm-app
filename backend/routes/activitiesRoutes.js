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

// ✅ 修正: フロントエンドの期待するエンドポイントに合わせて 'customers' (複数形) に変更
// 例: /api/activities/customers/:customerId
router.get("/customer/:customerId", activityController.getActivitiesByCustomer);

// 📄 特定の案件に紐づく活動履歴を取得 (新しいルート)
router.get("/sales/:saleId", activityController.getActivitiesBySaleId);

// ✏️ 活動履歴を更新
// router.put("/:id", activityController.updateActivity); // 既存の活動更新ルート

// 🗑️ 活動履歴を削除
// router.delete("/:id", activityController.deleteActivity); // 既存の活動削除ルート

module.exports = router;
