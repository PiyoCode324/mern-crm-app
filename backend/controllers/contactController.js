// backend/controllers/contactController.js

const Contact = require("../models/contactModel");

// 📄 問い合わせ一覧取得
exports.getContacts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }
    // ✅ 修正: 顧客詳細画面以外では、ログインユーザーの問い合わせのみを返す
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
    const {
      customerId,
      contactName,
      contactEmail,
      content,
      contactPhone,
      assignedUserId,
    } = req.body;

    if (!contactName || !contactEmail || !content) {
      return res
        .status(400)
        .json({ error: "氏名・メールアドレス・内容は必須です" });
    }

    const contact = new Contact({
      customerId: customerId || null,
      contactName,
      contactEmail,
      contactPhone: contactPhone || "",
      content,
      // ✅ 修正: フロントエンドから送信されたassignedUserIdを使用
      assignedUserId: assignedUserId || null,
    });

    const saved = await contact.save();
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

    if (contact.assignedUserId && contact.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    const {
      customerId,
      contactName,
      contactEmail,
      content,
      contactPhone,
      assignedUserId,
      responseStatus,
      memo,
    } = req.body;

    if (!contactName || !contactEmail || !content) {
      return res
        .status(400)
        .json({ error: "氏名・メールアドレス・内容は必須です" });
    }

    contact.customerId = customerId || contact.customerId;
    contact.contactName = contactName;
    contact.contactEmail = contactEmail;
    contact.content = content;
    contact.contactPhone = contactPhone || "";
    contact.assignedUserId = assignedUserId || contact.assignedUserId;
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
