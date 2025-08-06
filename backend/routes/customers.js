// backend/routes/customers.js (修正版)

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  getCustomers, // ✅ 修正: getAllCustomersからgetCustomersに変更
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} = require("../controllers/customerController");

// 🔐 認証ミドルウェアをすべてのルートに適用
router.use(verifyFirebaseToken);

// 📄 全顧客情報取得（ログインユーザーの顧客のみ）
router.get("/", getCustomers);

// 🔹 顧客新規登録
router.post("/", createCustomer);

// 🔸 顧客IDで取得
router.get("/:id", getCustomerById);

// ✏️ 顧客情報を更新
router.put("/:id", updateCustomer);

// 🗑️ 顧客を削除
router.delete("/:id", deleteCustomer);

module.exports = router;
