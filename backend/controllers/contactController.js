// backend/controllers/contactController.js

const Contact = require("../models/contactModel");
const mongoose = require("mongoose"); // ObjectIdのバリデーションに使用

// 📄 問い合わせ一覧取得
exports.getContacts = async (req, res) => {
  try {
    const filter = {};
    // 顧客IDがクエリパラメータに含まれている場合は、その顧客に紐づく問い合わせのみを返す
    if (req.query.customerId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
        return res.status(400).json({ error: "無効な顧客IDです" });
      }
      filter.customerId = req.query.customerId;
    }
    // 顧客IDが指定されていない場合は、ログインユーザーの問い合わせのみを返す
    if (!req.query.customerId) {
      filter.assignedUserId = req.user.uid;
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error("❌ 問い合わせ一覧取得エラー:", err);
    res.status(500).json({ error: "問い合わせ一覧の取得に失敗しました" });
  }
};

// ➕ 問い合わせを新規作成
exports.createContact = async (req, res) => {
  try {
    const { customerId, contactName, contactEmail, content, contactPhone } =
      req.body;

    if (!contactName || !content) {
      return res.status(400).json({ error: "氏名・内容は必須です" });
    }

    // ✅ セキュリティ強化: assignedUserIdは常にログインユーザーのIDを使用
    const newContact = new Contact({
      customerId: customerId || null,
      contactName,
      contactEmail,
      contactPhone: contactPhone || "",
      content,
      assignedUserId: req.user.uid, // ✅ ここで上書き
    });

    const saved = await newContact.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ 問い合わせ作成エラー:", err);
    res.status(400).json({ error: "問い合わせの作成に失敗しました" });
  }
};

// ✏️ 問い合わせを更新
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "問い合わせが見つかりません" });
    }

    // ✅ セキュリティチェック: assignedUserIdが一致するか確認
    if (contact.assignedUserId && contact.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    // `req.body`からデータを取得（assignedUserIdは更新しない）
    const {
      customerId,
      contactName,
      contactEmail,
      content,
      contactPhone,
      responseStatus,
      memo,
    } = req.body;

    // バリデーション
    if (!contactName || !content) {
      return res.status(400).json({ error: "氏名・内容は必須です" });
    }

    // データの更新
    contact.customerId = customerId || contact.customerId;
    contact.contactName = contactName;
    contact.contactEmail = contactEmail;
    contact.content = content;
    contact.contactPhone = contactPhone || "";
    contact.responseStatus = responseStatus || contact.responseStatus;
    contact.memo = memo || contact.memo;

    const updated = await contact.save();
    res.json(updated);
  } catch (err) {
    console.error("❌ 問い合わせ更新エラー:", err);
    res.status(400).json({ error: "問い合わせの更新に失敗しました" });
  }
};

// 🗑️ 問い合わせを削除
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "問い合わせが見つかりません" });
    }

    // ✅ セキュリティチェック: assignedUserIdが一致するか確認
    if (contact.assignedUserId && contact.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "問い合わせを削除しました" });
  } catch (err) {
    console.error("❌ 問い合わせ削除エラー:", err);
    res.status(500).json({ error: "問い合わせの削除に失敗しました" });
  }
};
