// src/pages/NewContactPage.jsx

import ContactForm from "../components/ContactForm"; // 問い合わせフォームコンポーネントをインポート
import { useNavigate } from "react-router-dom"; // ページ遷移用フックをインポート

const NewContactPage = () => {
  const navigate = useNavigate(); // ページ遷移用関数を取得

  // フォーム送信成功時に呼ばれるコールバック関数
  // 送信が成功したら問い合わせ一覧ページに遷移させる
  const handleSuccess = () => {
    navigate("/contacts"); // /contacts ページへ遷移
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold mb-4">新規問い合わせ登録</h1>

      {/* 問い合わせフォーム */}
      {/* onSuccess に handleSuccess を渡して、送信成功後の動作を指定 */}
      <ContactForm onSuccess={handleSuccess} />
    </div>
  );
};

export default NewContactPage;
