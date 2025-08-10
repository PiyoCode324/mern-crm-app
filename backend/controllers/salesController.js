// backend/controllers/salesController.js

const Sales = require("../models/Sales");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

// ✅ 新しい案件を作成する関数
exports.createSale = asyncHandler(async (req, res) => {
  const { dealName, customerId, amount, status, notes, dueDate } = req.body;
  const assignedUserId = req.user.uid;

  if (!dealName || !customerId || !amount) {
    res.status(400);
    throw new Error("必要な項目が不足しています");
  }

  const sale = await Sales.create({
    dealName,
    customerId,
    amount,
    status,
    notes,
    assignedUserId,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  res.status(201).json(sale);
});

// 📄 ログインユーザーに紐づくすべての営業案件を取得
exports.getSales = asyncHandler(async (req, res) => {
  const sales = await Sales.find({ assignedUserId: req.user.uid }).sort({
    createdAt: -1,
  });
  res.status(200).json(sales);
});

// ✅ 案件を更新する関数
exports.updateSale = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dealName, customerId, amount, status, notes, dueDate } = req.body;
  const assignedUserId = req.user.uid;

  const sale = await Sales.findById(id);

  if (!sale) {
    res.status(404);
    throw new Error("案件が見つかりません");
  }

  // 担当ユーザー以外は更新できないようにする
  if (sale.assignedUserId !== assignedUserId) {
    res.status(403);
    throw new Error("権限がありません");
  }

  sale.dealName = dealName || sale.dealName;
  sale.customerId = customerId || sale.customerId;
  sale.amount = amount || sale.amount;
  sale.status = status || sale.status;
  sale.notes = notes || sale.notes;
  sale.dueDate = dueDate ? new Date(dueDate) : null;

  const updatedSale = await sale.save();
  res.status(200).json(updatedSale);
});

// 🗑️ 特定の営業案件を削除
exports.deleteSale = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedSale = await Sales.findOneAndDelete({
    _id: id,
    assignedUserId: req.user.uid,
  });

  if (!deletedSale) {
    res.status(404);
    throw new Error("対象の案件が見つかりませんでした。");
  }

  res.status(200).json({ message: "案件を削除しました" });
});

// ✅ 営業案件のサマリーを取得する関数 (最終修正版)
exports.getSalesSummary = asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  // 1. ステータスごとの集計パイプラインを実行
  const statusSummary = await Sales.aggregate([
    { $match: { assignedUserId: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        status: "$_id",
        _id: 0,
        count: 1,
        totalAmount: 1,
      },
    },
  ]);

  // 2. 顧客別の売上集計
  const customerSales = await Sales.aggregate([
    { $match: { assignedUserId: userId } },
    {
      $group: {
        _id: "$customerId",
        totalAmount: { $sum: "$amount" },
        dealCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerDetails",
      },
    },
    {
      $unwind: "$customerDetails",
    },
    {
      $project: {
        _id: 0,
        customerName: "$customerDetails.companyName",
        totalAmount: 1,
        dealCount: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // 3. 全体サマリーの集計
  const totalSummary = await Sales.aggregate([
    { $match: { assignedUserId: userId } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$amount" },
        totalDeals: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        totalDeals: 1,
        averageDealValue: {
          $divide: ["$totalSales", "$totalDeals"],
        },
      },
    },
  ]);

  // 4. 期限が近い案件の取得 (7日以内)
  const now = new Date();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeals = await Sales.find({
    assignedUserId: userId,
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
    status: { $ne: "契約済" },
  }).sort({ dueDate: 1 });

  const summary =
    totalSummary.length > 0
      ? totalSummary[0]
      : {
          totalSales: 0,
          totalDeals: 0,
          averageDealValue: 0,
        };

  res.status(200).json({
    ...summary,
    statusSummary,
    customerSales,
    upcomingDeals,
  });
});

// 特定の顧客に紐づく案件を取得する関数
exports.getSalesByCustomerId = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const userId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  const sales = await Sales.find({
    customerId,
    assignedUserId: userId,
  }).sort({ createdAt: -1 });

  res.status(200).json(sales);
});
