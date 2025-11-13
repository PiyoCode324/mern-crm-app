// components/DeleteButton.jsx
// -----------------------------------------
// 顧客削除ボタンコンポーネント
// propsで受け取ったidに対応する顧客を削除
// API通信には utils/api.js のラッパーを使用
// -----------------------------------------

import api from "../utils/api"; // axiosなどで設定したAPIラッパーをインポート

const DeleteButton = ({ id }) => {
  // 削除ボタン押下時の処理
  const handleDelete = async () => {
    try {
      // APIのDELETEリクエストを送信
      await api.delete(`/customers/${id}`);
      console.log("Deleted"); // 削除成功時のコンソールログ
    } catch (err) {
      // 削除失敗時のエラー表示
      console.error("Delete error:", err);
    }
  };

  return (
    // ボタン押下でhandleDeleteを呼び出す
    <button onClick={handleDelete}>Delete</button>
  );
};

export default DeleteButton;
