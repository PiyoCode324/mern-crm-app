// backend/controllers/salesController.js

const Sales = require("../models/Sales");
const mongoose = require("mongoose");

// 🔹 営業案件を新規登録
exports.createSale = async (req, res) => {
  try {
    const { dealName, customerId, amount, status, notes } = req.body;

    const newSale = new Sales({
      dealName,
      customerId,
      amount,
      status,
      notes,
      assignedUserId: req.user.uid, // ✅ ログインユーザーのIDを自動で紐づけ
    });

    const savedSale = await newSale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    console.error("❌ 案件登録エラー:", error);
    res
      .status(400)
      .json({ message: "案件の登録に失敗しました", error: error.message });
  }
};

// 📄 ログインユーザーに紐づくすべての営業案件を取得
exports.getSales = async (req, res) => {
  try {
    // ✅ ログインユーザーのIDでフィルタリング
    const sales = await Sales.find({ assignedUserId: req.user.uid }).sort({
      createdAt: -1,
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error("❌ 案件取得エラー:", error);
    res
      .status(500)
      .json({ message: "案件の取得に失敗しました", error: error.message });
  }
};

// ✏️ 特定の営業案件を更新
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSale = await Sales.findOneAndUpdate(
      // ✅ 案件IDと担当者IDでフィルタリング
      { _id: id, assignedUserId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res
        .status(404)
        .json({ message: "対象の案件が見つかりませんでした。" });
    }

    res.status(200).json({ message: "案件を更新しました", updatedSale });
  } catch (error) {
    console.error("❌ 案件更新エラー:", error);
    res
      .status(400)
      .json({ message: "案件の更新に失敗しました", error: error.message });
  }
};

// 🗑️ 特定の営業案件を削除
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSale = await Sales.findOneAndDelete({
      // ✅ 案件IDと担当者IDでフィルタリング
      _id: id,
      assignedUserId: req.user.uid,
    });

    if (!deletedSale) {
      return res
        .status(404)
        .json({ message: "対象の案件が見つかりませんでした。" });
    }

    res.status(200).json({ message: "案件を削除しました" });
  } catch (error) {
    console.error("❌ 案件削除エラー:", error);
    res
      .status(500)
      .json({ message: "案件の削除に失敗しました", error: error.message });
  }
};

// 営業案件のサマリーを取得する関数
exports.getSalesSummary = async (req, res) => {
  try {
    const userId = req.user.uid;

    // パイプラインを定義
    const summary = await Sales.aggregate([
      // 1. ログインユーザーの案件のみをフィルタリング
      { $match: { assignedUserId: userId } },
      // 2. 案件を集計
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" }, // 全案件の金額を合計
          totalDeals: { $sum: 1 }, // 案件数をカウント
        },
      },
      // 3. 平均金額を計算
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalDeals: 1,
          averageDealValue: { $divide: ["$totalSales", "$totalDeals"] },
        },
      },
    ]);

    // サマリーデータが存在しない場合はデフォルト値を返す
    if (summary.length === 0) {
      return res.status(200).json({
        totalSales: 0,
        totalDeals: 0,
        averageDealValue: 0,
      });
    }

    res.status(200).json(summary[0]);
  } catch (error) {
    console.error("売上サマリーの取得に失敗しました:", error);
    res.status(500).json({ message: "売上サマリーの取得に失敗しました" });
  }
};
