// backend/controllers/contactController.js

const Contact = require("../models/contactModel");

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = await Contact.create({ name, email, message });

    res.status(201).json({
      message: "お問い合わせを受け付けました。",
      contact: newContact,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { submitContact };
