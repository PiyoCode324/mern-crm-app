// src/pages/FreeContactPage.jsx

import ContactForm from "../components/ContactForm"; // お問い合わせフォームコンポーネントをインポート
import { useNavigate } from "react-router-dom"; // ページ遷移用フックをインポート
import CustomModal from "../components/CustomModal"; // カスタムモーダルコンポーネントをインポート
import { useState } from "react"; // Reactの状態管理フックをインポート

// FreeContactPageコンポーネント
const FreeContactPage = () => {
  const navigate = useNavigate(); // ページ遷移用関数
  const [modalOpen, setModalOpen] = useState(false); // モーダル表示状態を管理

  // フォーム送信成功時の処理
  const handleSuccess = () => {
    setModalOpen(true); // モーダルを開く
  };

  // モーダルを閉じる処理
  const closeModal = () => {
    setModalOpen(false); // モーダルを閉じる
    navigate("/"); // トップページへ遷移
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold mb-4">お問い合わせ</h1>
      {/* 説明文 */}
      <p className="mb-4">ご質問やご相談など、お気軽にお問い合わせください。</p>

      {/* ContactFormコンポーネントを設置 */}
      <ContactForm onSuccess={handleSuccess} isPublic={true} />

      {/* 成功時に表示されるカスタムモーダル */}
      <CustomModal isOpen={modalOpen} onClose={closeModal}>
        <div className="p-4 text-center">
          <p className="text-lg font-semibold">
            お問い合わせありがとうございます。
          </p>
          <p className="mt-2">内容を確認後、担当者よりご連絡いたします。</p>
          <button
            onClick={closeModal} // ボタン押下でモーダル閉じる + トップページ遷移
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </CustomModal>
    </div>
  );
};

export default FreeContactPage; // 他ファイルからインポート可能にする
