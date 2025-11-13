// backend/routes/salesRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  createSales,
  updateSales,
  deleteSales,
  getSalesById,
  getAllSalesByUser,
  getSalesByCustomer,
  getSalesSummary, // ✅ ダッシュボード用の案件サマリー取得コントローラー
} = require("../controllers/salesController");

// 🔐 すべてのルートに認証ミドルウェアを適用
router.use(verifyFirebaseToken);

// --- ルート定義 ---

// 📊 ダッシュボード用: 全ユーザー案件のサマリーを取得
router.get("/summary", getSalesSummary);

// 📄 特定の顧客に紐づく案件を取得
// 例: /api/sales/customer/:customerId
router.get("/customer/:customerId", getSalesByCustomer);

// 📄 ログインユーザーに紐づく案件を全て取得
router.get("/", getAllSalesByUser);

// 🔹 新しい案件を作成
router.post("/", createSales);

// 📄 特定の案件をIDで取得
// 例: /api/sales/:id
router.get("/:id", getSalesById);

// ✏️ 案件情報を更新
// 例: PUT /api/sales/:id
router.put("/:id", updateSales);

// 🗑️ 案件を削除
// 例: DELETE /api/sales/:id
router.delete("/:id", deleteSales);

module.exports = router;
