// src/utils/userNameCache.js

import axios from "axios";

/**
 * @desc UID（Firebase/MongoDBユーザーID）からユーザー名を取得し、キャッシュする関数
 * @note 同じUIDに対するAPIリクエストを最小化するため、簡易キャッシュ機能を実装
 */

const cache = {}; // { uid: displayName } 形式で保持

/**
 * @param {string} uid - 取得したいユーザーのUID
 * @param {string} token - Firebase認証トークン
 * @returns {Promise<string>} ユーザー名（存在しなければ "不明"）
 */
export const fetchUserName = async (uid, token) => {
  // UIDが未指定の場合は "不明" を返す
  if (!uid) return "不明";

  // キャッシュに存在すれば即返却
  if (cache[uid]) return cache[uid];

  try {
    // UIDからユーザー情報を取得
    const response = await axios.get(`http://localhost:5000/api/users/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const displayName = response.data?.displayName || "不明";

    // キャッシュに保存
    cache[uid] = displayName;

    return displayName;
  } catch (err) {
    console.error("ユーザー名取得エラー:", err);
    return "不明";
  }
};
