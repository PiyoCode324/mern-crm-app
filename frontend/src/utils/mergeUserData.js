// src/utils/mergeUserData.js

import axios from "axios";

/**
 * FirebaseユーザーとMongoDBユーザー情報を統合する関数
 *
 * 処理の流れ:
 * 1. 引数の firebaseUser からIDトークンを取得
 * 2. 取得したトークンを使って自サーバーの /api/users/me へリクエスト
 * 3. サーバーから返却されたMongoDBユーザー情報とFirebaseユーザー情報を統合
 * 4. 統合オブジェクトを返却
 * 5. 失敗した場合は null を返す
 *
 * @param {object} firebaseUser - Firebaseのユーザーオブジェクト
 * @returns {object|null} 統合ユーザー情報 または取得失敗時は null
 */
export const fetchAndMergeUserData = async (firebaseUser) => {
  try {
    // FirebaseユーザーからIDトークンを取得
    const idToken = await firebaseUser.getIdToken();

    // サーバーへユーザー情報取得リクエスト（認証ヘッダーにIDトークンを設定）
    const response = await axios.get("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const mongoUser = response.data.user;

    // Firebaseユーザー情報とMongoDBユーザー情報を統合して返却
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      ...mongoUser,
    };
  } catch (error) {
    console.error("ユーザー統合データの取得に失敗:", error);
    return null;
  }
};
