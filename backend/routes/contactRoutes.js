// backend/routes/contactRoutes.js (修正版)

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

// ✅ 修正: 認証ミドルウェア適用前に、認証不要なルートを定義する
// ログイン不要の公開フォーム用エンドポイント
// これにより、誰でも問い合わせを登録できるようになります。
router.post("/", createContact);

// 🔐 認証が必要なルートは、この下に定義する
router.use(verifyFirebaseToken);

// 📄 問い合わせ一覧取得（認証必須）
router.get("/", getContacts);

// ✏️ 問い合わせ情報を更新（認証必須）
router.put("/:id", updateContact);

// 🗑️ 問い合わせを削除（認証必須）
router.delete("/:id", deleteContact);

module.exports = router;
