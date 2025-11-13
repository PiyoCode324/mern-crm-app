// pages/EditCustomer.jsx

import { useState } from "react";
import api from "../utils/api"; // APIリクエスト用の共通モジュールをインポート

// EditCustomerコンポーネント
// propsとして顧客ID(id)と現在の名前(currentName)を受け取る
const EditCustomer = ({ id, currentName }) => {
  // 入力フォームの状態を管理するstate
  // 初期値は渡されたcurrentName
  const [name, setName] = useState(currentName);

  // 顧客情報を更新する関数
  const handleUpdate = async () => {
    try {
      // PUTリクエストで顧客情報を更新
      const res = await api.put(`/customers/${id}`, { name });
      console.log("Updated:", res.data); // 更新後のデータをコンソール表示
    } catch (err) {
      console.error("Update error:", err); // エラー発生時にコンソール表示
    }
  };

  return (
    <>
      {/* 顧客名入力フォーム */}
      <input
        type="text"
        value={name} // stateをバインド
        onChange={(e) => setName(e.target.value)} // 入力値変更時にstate更新
      />
      {/* 更新ボタン */}
      <button onClick={handleUpdate}>Update</button>
    </>
  );
};

export default EditCustomer; // 他のファイルからインポート可能にする
