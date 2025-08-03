// backend/routes/sales.js

const express = require("express");
const router = express.Router();
const {
  createSale,
  getAllSales,
  deleteSale,
  updateSale,
} = require("../controllers/salesController");

router.post("/", createSale); // 売上データ登録
router.get("/", getAllSales); // 売上データ取得
router.delete("/:id", deleteSale); // 売上データ削除
router.put("/:id", updateSale); // 売上データ更新

module.exports = router;
