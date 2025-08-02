// backend/routes/users.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// 認証済みユーザーのみ許可
router.use(verifyFirebaseToken);

router.post("/register", async (req, res) => {
  try {
    // req.body ではなく、認証情報から uid と email を取得
    const { uid, email } = req.user;

    if (!uid || !email) {
      return res.status(400).json({ message: "uidとemailは必須です" });
    }

    // すでに存在するかチェック
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ message: "ユーザーはすでに存在します" });
    }

    // 新規ユーザー作成
    const newUser = new User({ uid, email });
    await newUser.save();

    return res.status(201).json({ message: "ユーザー作成完了", user: newUser });
  } catch (err) {
    console.error("❌ ユーザー登録エラー:", err);
    return res.status(500).json({ message: "サーバーエラー" });
  }
});

module.exports = router;
