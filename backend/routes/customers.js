// backend/routes/customers.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

const {
  getCustomers,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  // 💡 追加: ステータス別顧客取得とステータス更新のコントローラー
  getCustomersByStatus,
  updateCustomerStatus,
} = require("../controllers/customerController");

const {
  getTasksByCustomer, // 💡 追加: 顧客別タスク取得のコントローラー
} = require("../controllers/taskController");

// ====================================
// 🔐 認証ミドルウェア適用
// → 以降のルートはすべてログインユーザーのみアクセス可能
// ====================================
router.use(verifyFirebaseToken);

// ====================================
// 📄 顧客取得関連
// ====================================

// 📄 管理者向け: 全顧客を取得できるエンドポイント
//    例: GET /api/customers/all
router.get("/all", getAllCustomers);

// 📄 ログインユーザーに紐づく顧客のみを取得
//    例: GET /api/customers
router.get("/", getCustomers);

// 💡 ステータス別に顧客を取得
//    例: GET /api/customers/status/提案中
router.get("/status/:status", getCustomersByStatus);

// 💡 顧客のステータスを更新
//    例: PUT /api/customers/:id/status
router.put("/:id/status", updateCustomerStatus);

// 💡 特定の顧客に紐づくタスクを取得
//    例: GET /api/customers/:id/tasks
router.get("/:id/tasks", getTasksByCustomer);

// ====================================
// ✏️ 顧客の新規登録・取得・更新・削除
// ====================================

// 🔹 顧客新規登録
//    例: POST /api/customers
router.post("/", createCustomer);

// 🔸 顧客IDで1件取得
//    例: GET /api/customers/:id
router.get("/:id", getCustomerById);

// ✏️ 顧客情報を更新
//    例: PUT /api/customers/:id
router.put("/:id", updateCustomer);

// 🗑️ 顧客を削除
//    例: DELETE /api/customers/:id
router.delete("/:id", deleteCustomer);

module.exports = router;
