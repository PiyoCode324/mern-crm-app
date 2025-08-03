// backend/routes/contactRoutes.js

const express = require("express");
const router = express.Router();
const Contact = require("../models/contactModel");
const { submitContact } = require("../controllers/contactController");

// 全件取得（GET /api/contacts）
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.json(contacts);
  } catch (error) {
    console.error("エラー内容:", error);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// 単体取得（GET /api/contacts/:id）
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("エラー内容:", error);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// 作成（POST /api/contacts）
router.post("/", submitContact); // controllerで完結しているのでこれでOK

// 更新（PUT /api/contacts/:id）
router.put("/:id", async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(updatedContact);
  } catch (error) {
    console.error("エラー内容:", error);
    res.status(400).json({ message: "更新に失敗しました" });
  }
});

// 削除（DELETE /api/contacts/:id）
router.delete("/:id", async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("エラー内容:", error);
    res.status(500).json({ message: "削除に失敗しました" });
  }
});

module.exports = router;
