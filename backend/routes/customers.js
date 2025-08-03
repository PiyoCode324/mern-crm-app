// backend/routes/customers.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");

// 🔐 認証ミドルウェアをすべてのルートに適用
router.use(verifyFirebaseToken);

// 📄 顧客一覧取得（ログインユーザーの顧客のみ）
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({
      assignedUserId: req.user.uid,
    }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error("❌ 顧客取得エラー:", err);
    res.status(500).json({ error: "顧客の取得に失敗しました" });
  }
});

// ➕ 顧客を新規追加
router.post("/", async (req, res) => {
  try {
    const { name, companyName, email, phone, status, contactMemo } = req.body;

    if (!name) {
      return res.status(400).json({ error: "顧客名は必須です" });
    }

    const newCustomer = new Customer({
      name,
      companyName,
      email,
      phone,
      status: status || "見込み",
      contactMemo,
      assignedUserId: req.user.uid,
    });

    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ 顧客追加エラー:", err);
    res.status(400).json({ error: "顧客の追加に失敗しました" });
  }
});

// ✏️ 顧客情報を更新（PUT /customers/:id）
router.put("/:id", async (req, res) => {
  try {
    const { name, companyName, email, phone, status, contactMemo } = req.body;

    if (!name) {
      return res.status(400).json({ error: "顧客名は必須です" });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "顧客が見つかりません" });
    }

    if (customer.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    customer.name = name;
    customer.companyName = companyName || "";
    customer.email = email || "";
    customer.phone = phone || "";
    customer.status = status || "見込み";
    customer.contactMemo = contactMemo || "";

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    console.error("❌ 顧客更新エラー:", err);
    res.status(400).json({ error: "顧客の更新に失敗しました" });
  }
});

// 🗑️ 顧客を削除（DELETE /customers/:id）
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "顧客が見つかりません" });
    }
    if (customer.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "顧客を削除しました" });
  } catch (err) {
    console.error("❌ 顧客削除エラー:", err);
    res.status(500).json({ error: "顧客の削除に失敗しました" });
  }
});

module.exports = router;
