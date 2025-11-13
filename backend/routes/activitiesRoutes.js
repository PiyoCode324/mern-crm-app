// backend/routes/activitiesRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");

// 🔐 認証ミドルウェアを適用
// すべてのルートでFirebaseトークンの検証を行い、未認証ユーザーはアクセス不可
router.use(verifyFirebaseToken);

// --- ユーザーIDに紐づくアクティビティを取得 ---
// GET /activities/user
router.get(
  "/user",
  (req, res, next) => {
    // 🔹 デバッグ用：リクエストを行ったユーザーUIDをログ出力
    console.log("📝 GET /activities/user called by:", req.user.uid);
    next();
  },
  activityController.getActivitiesByUser
);

// --- 全てのアクティビティを取得（管理者向け） ---
// GET /activities/all
router.get(
  "/all",
  (req, res, next) => {
    // 🔹 デバッグ用：管理者リクエストのログ出力
    console.log("📝 GET /activities/all called by:", req.user.uid);
    next();
  },
  activityController.getAllActivities
);

// ✅ 特定の顧客に紐づく活動履歴を取得
// GET /activities/customer/:customerId
router.get(
  "/customer/:customerId",
  (req, res, next) => {
    // 🔹 デバッグ用：対象顧客IDとリクエストユーザーUIDをログ出力
    console.log(
      `📝 GET /activities/customer/${req.params.customerId} called by:`,
      req.user.uid
    );
    next();
  },
  activityController.getActivitiesByCustomer
);

// ✅ 特定の案件に紐づく活動履歴を取得
// GET /activities/sales/:saleId
router.get(
  "/sales/:saleId",
  (req, res, next) => {
    // 🔹 デバッグ用：対象案件IDとリクエストユーザーUIDをログ出力
    console.log(
      `📝 GET /activities/sales/${req.params.saleId} called by:`,
      req.user.uid
    );
    next();
  },
  activityController.getActivitiesBySaleId
);

// ✅ 特定のタスクに紐づく活動履歴を取得
// GET /activities/tasks/:taskId
router.get(
  "/tasks/:taskId",
  (req, res, next) => {
    // 🔹 デバッグ用：対象タスクIDとリクエストユーザーUIDをログ出力
    console.log(
      `📝 GET /activities/tasks/${req.params.taskId} called by:`,
      req.user.uid
    );
    next();
  },
  activityController.getActivitiesByTask
);

// 🔹 ルーターをエクスポート
module.exports = router;
