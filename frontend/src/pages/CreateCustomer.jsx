// pages/CreateCustomer.jsx
import { useState } from "react";
import api from "../utils/api"; // Axiosをラップした共通APIユーティリティ

const CreateCustomer = () => {
  // フォーム入力値を管理する状態
  const [name, setName] = useState("");

  /**
   * フォーム送信時のハンドラー
   * @param {Event} e - フォーム送信イベント
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // ページリロードを防止
    try {
      // POSTリクエストで新規顧客を作成
      const res = await api.post("/customers", { name });
      console.log("✅ 作成成功:", res.data);
    } catch (err) {
      // エラー発生時はコンソールに出力
      console.error("❌ 作成失敗:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 顧客名入力 */}
      <input
        type="text"
        value={name} // 入力値を状態と同期
        onChange={(e) => setName(e.target.value)} // 入力値が変化したら状態を更新
        placeholder="Customer Name" // プレースホルダー
      />
      {/* 送信ボタン */}
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateCustomer;
