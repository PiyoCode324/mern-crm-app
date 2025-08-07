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
} = require("../controllers/salesController");

// 🔐 認証ミドルウェアをすべてのルートに適用
router.use(verifyFirebaseToken);

// 📄 案件一覧取得
router.get("/", getSales);

// 🔹 案件を新規登録
router.post("/", createSale);

// ✏️ 案件情報を更新
router.put("/:id", updateSale);

// 🗑️ 案件を削除
router.delete("/:id", deleteSale);

router.get("/summary", getSalesSummary);

module.exports = router;
