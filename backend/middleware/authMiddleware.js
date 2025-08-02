// middleware/authMiddleware.js

const admin = require("firebase-admin");
const serviceAccount = require("../firebaseServiceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未認証：トークンがありません" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Firebase トークン検証エラー:", err.message);
    return res.status(401).json({ message: "未認証：トークンが無効です" });
  }
};

module.exports = { verifyFirebaseToken };
