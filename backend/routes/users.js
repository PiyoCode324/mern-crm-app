// backend/routes/users.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Firebase認証が必要
router.use(verifyFirebaseToken);

// 🔹 初回登録（MongoDBにユーザー登録）
router.post("/register", registerUser);

// 🔸 現在のユーザー情報取得
router.get("/me", getUser);

// 🔸 現在のユーザー情報更新
router.put("/me", updateUser);

// 🔸 現在のユーザー削除
router.delete("/me", deleteUser);

module.exports = router;
