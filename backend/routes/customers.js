// backend/routes/customers.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");

// 🔐 認証ミドルウェアをすべてのルートに適用
router.use(verifyFirebaseToken);

// 📄 顧客一覧を取得（MongoDB から）
router.get("/", async (req, res) => {
  try {
    // ログインユーザーのIDでフィルタ（必要に応じて）
    const customers = await Customer.find({
      assignedUserId: req.user.uid,
    });

    res.json(customers);
  } catch (err) {
    console.error("❌ 顧客取得エラー:", err);
    res.status(500).json({ error: "顧客の取得に失敗しました" });
  }
});

// ➕ 顧客を新規追加
router.post("/", async (req, res) => {
  try {
    const { name, industry, contact } = req.body;

    if (!name) {
      return res.status(400).json({ error: "顧客名は必須です" });
    }

    const newCustomer = new Customer({
      name,
      industry,
      contact,
      assignedUserId: req.user.uid, // Firebase Auth の UID を保存
    });

    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ 顧客追加エラー:", err);
    res.status(400).json({ error: "顧客の追加に失敗しました" });
  }
});

module.exports = router;
