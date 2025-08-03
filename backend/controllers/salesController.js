// backend/controllers/salesController.js

const Sales = require("../models/sales"); // models/sales.jsのモデルを正しく参照

// 売上データ登録
exports.createSale = async (req, res) => {
  try {
    // フロントエンドのフォームデータに合わせて修正
    const { productName, unitPrice, quantity, saleDate } = req.body;

    const newSale = new Sales({
      productName,
      unitPrice,
      quantity,
      saleDate,
    });

    const savedSale = await newSale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Error creating sale:", error); // デバッグ用にエラーログを出力
    // Mongooseのバリデーションエラーを返す
    res
      .status(400)
      .json({ message: "売上データの登録に失敗しました", error: error });
  }
};

// 売上データ取得（新規追加）
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find().sort({ date: -1 }); // 日付の新しい順にソート（任意）
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "売上データの取得に失敗しました", error });
  }
};

// 売上データ削除
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params; // 例: DELETE /sales/:id で送られてくる

    const deletedSale = await Sales.findByIdAndDelete(id);

    if (!deletedSale) {
      return res
        .status(404)
        .json({ message: "対象の売上データが見つかりませんでした。" });
    }

    res.status(200).json({ message: "削除に成功しました", deletedSale });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "売上データの削除に失敗しました", error });
  }
};

// 売上データ更新
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params; // URLパラメータのIDを取得

    const updatedSale = await Sales.findByIdAndUpdate(
      id,
      req.body, // req.bodyの内容で更新
      { new: true } // 更新後のデータを返す
    );

    if (!updatedSale) {
      return res
        .status(404)
        .json({ message: "対象の売上データが見つかりませんでした。" });
    }

    res.status(200).json({ message: "更新に成功しました", updatedSale });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "売上データの更新に失敗しました", error });
  }
};
