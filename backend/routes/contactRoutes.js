// backend/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const contactController = require("../controllers/contactController");

router.use(verifyFirebaseToken);

router.get("/", contactController.getContacts);
router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);

module.exports = router;
