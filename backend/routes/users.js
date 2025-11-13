// backend/routes/users.js

const express = require("express");
const router = express.Router();
const {
  verifyFirebaseToken,
  isAdmin,
} = require("../middleware/authMiddleware");
const {
  registerUser,
  getMe,
  updateUser,
  deleteUser,
  getUsers,
  getAllUsers,
  updateUserRole,
  getUsersBasic,
  toggleUserDisabledStatus,
  getUserById, // ✅ 新規: 管理者用で特定ユーザー取得
} = require("../controllers/userController");

// 🔹 初回登録（MongoDBにユーザー登録）
// ※ verifyFirebaseTokenはスキップ。初回登録時はFirebaseトークンがない場合があるため
router.post("/register", registerUser);

// ----------------------------------------------------
// 以下のルートはすべて認証必須（Firebaseトークンを検証）
// ----------------------------------------------------
router.use(verifyFirebaseToken);

// ✅ 管理者専用: すべてのユーザー情報を取得
router.get("/all", isAdmin, getAllUsers);

// 🔸 自分自身の情報を取得
router.get("/me", getMe);

// 🔸 自分自身の情報を更新
router.put("/me", updateUser);

// 🔸 自分自身のアカウントを削除
router.delete("/me", deleteUser);

// ✅ IDで特定ユーザーを取得
router.get("/", getUsers);

// 🔹 基本情報のみ取得（すべての認証ユーザーが閲覧可能）
router.get("/basic", getUsersBasic);

// ✅ 管理者専用: ユーザーの役割を変更
router.put("/:id/role", isAdmin, updateUserRole);

// ✅ 管理者専用: ユーザーの有効/無効を切り替え
router.put("/:id/disabled", isAdmin, toggleUserDisabledStatus);

// ✅ 管理者専用: 特定のユーザー情報を取得
router.get("/:id", isAdmin, getUserById);

module.exports = router;
