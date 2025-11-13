// backend/controllers/contactController.js

const Contact = require("../models/contactModel"); // 問い合わせ(Contact)を管理するMongooseモデル
const mongoose = require("mongoose");

// 📄 問い合わせ一覧取得
exports.getContacts = async (req, res) => {
  try {
    const filter = {}; // MongoDB検索条件を格納するオブジェクト
    const isAdmin = req.user && req.user.role === "admin"; // ログインユーザーが管理者かどうか

    // 顧客IDがクエリパラメータに指定されている場合
    if (req.query.customerId) {
      // 顧客IDの形式チェック
      if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
        return res.status(400).json({ error: "無効な顧客IDです" });
      }
      filter.customerId = req.query.customerId; // 顧客IDでフィルタリング
    } else if (!isAdmin) {
      // 管理者でない場合は、自分に割り当てられた問い合わせのみ取得
      if (req.user && req.user.uid) {
        filter.assignedUserId = req.user.uid;
      } else {
        // ログインしていない場合は空の配列を返す
        return res.json([]);
      }
    }

    // 検索条件に基づき問い合わせを新しい順に取得
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
      customerName,
      contactName,
      contactEmail,
      content,
      contactPhone,
      responseStatus,
    } = req.body;

    // 氏名と内容は必須
    if (!contactName || !content) {
      return res.status(400).json({ error: "氏名・内容は必須です" });
    }

    // ログインユーザーIDを担当者として設定（未ログインならnull）
    const assignedUserId = req.user ? req.user.uid : null;

    // 新しい問い合わせデータを作成
    const newContact = new Contact({
      customerId: customerId || null,
      customerName,
      contactName,
      contactEmail,
      contactPhone: contactPhone || "",
      content,
      responseStatus: responseStatus || "未対応", // ステータス未指定なら「未対応」
      assignedUserId,
    });

    // DBに保存
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
    // 該当IDの問い合わせを取得
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "問い合わせが見つかりません" });
    }

    const isAdmin = req.user && req.user.role === "admin";

    // 管理者以外は自分に割り当てられた問い合わせのみ編集可能
    if (!isAdmin && contact.assignedUserId !== req.user.uid) {
      return res.status(403).json({ error: "権限がありません" });
    }

    // 更新データをリクエストから取得
    const {
      customerId,
      customerName,
      contactName,
      contactEmail,
      content,
      contactPhone,
      responseStatus,
      memo,
      assignedUserId, // 🚨 担当者変更は管理者のみ可能
    } = req.body;

    // 必須チェック
    if (!contactName || !content) {
      return res.status(400).json({ error: "氏名・内容は必須です" });
    }

    // 各フィールドを更新（未指定なら既存値を保持）
    contact.customerId = customerId || contact.customerId;
    contact.customerName = customerName || contact.customerName;
    contact.contactName = contactName;
    contact.contactEmail = contactEmail;
    contact.content = content;
    contact.contactPhone = contactPhone || "";
    contact.responseStatus = responseStatus || contact.responseStatus;
    contact.memo = memo || contact.memo;

    // 🚨 担当者変更は管理者のみ許可
    if (isAdmin && assignedUserId) {
      contact.assignedUserId = assignedUserId;
    }

    // DBに保存
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

    const isAdmin = req.user && req.user.role === "admin";

    // 担当者でない & 管理者でない場合は削除不可
    if (
      !isAdmin &&
      contact.assignedUserId &&
      contact.assignedUserId !== req.user.uid
    ) {
      return res.status(403).json({ error: "権限がありません" });
    }

    // 該当データを削除
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "問い合わせを削除しました" });
  } catch (err) {
    console.error("❌ 問い合わせ削除エラー:", err);
    res.status(500).json({ error: "問い合わせの削除に失敗しました" });
  }
};
