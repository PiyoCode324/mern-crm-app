// backend/routes/salesRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  getSalesSummary,
  getSalesByCustomerId,
} = require("../controllers/salesController");

// 🔐 認証ミドルウェアをすべてのルートに適用
router.use(verifyFirebaseToken);

// 📄 案件一覧取得
router.get("/", getSales);

// 🔹 案件を新規登録
router.post("/", createSale);

router.get("/summary", getSalesSummary);

router.get("/customer/:customerId", getSalesByCustomerId);

// ✏️ 案件情報を更新
router.put("/:id", updateSale);

// 🗑️ 案件を削除
router.delete("/:id", deleteSale);

module.exports = router;
