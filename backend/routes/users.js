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
} = require("../controllers/userController");

// 🔹 初回登録（MongoDBにユーザー登録）
// ✅ 修正: 他のルートより前に配置し、verifyFirebaseTokenをスキップさせる
router.post("/register", registerUser);

// ----------------------------------------------------
// ✅ 以下のすべてのルートは、Firebase認証が必要
router.use(verifyFirebaseToken);
// ----------------------------------------------------

// 🔸 現在のユーザー情報取得
router.get("/me", getMe);

// 🔸 現在のユーザー情報更新
router.put("/me", updateUser);

// 🔸 現在のユーザー削除
router.delete("/me", deleteUser);

// ✅ 元のルート：IDクエリでユーザーを取得
router.get("/", getUsers);

// ✅ 新しいルート：管理者専用で、すべてのユーザーを取得
router.get("/all", isAdmin, getAllUsers);

// すべての認証ユーザーが利用可能なユーザー一覧取得（閲覧に必要な情報のみ返す）
router.get("/basic", getUsersBasic);

// ✅ 新しいルート：管理者専用で、ユーザーの役割を更新
router.put("/:id/role", isAdmin, updateUserRole);

module.exports = router;
