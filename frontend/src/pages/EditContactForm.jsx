// src/pages/EditContactForm.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm"; // 問い合わせ作成・編集フォームコンポーネント
import { authorizedRequest } from "../services/authService"; // 認証付きAPIリクエスト関数
import { useAuth } from "../context/AuthContext"; // 認証情報（tokenなど）を取得するフック

const EditContactForm = () => {
  const { id } = useParams(); // URLパラメータから問い合わせIDを取得
  const { token } = useAuth(); // 認証トークンを取得
  const [contact, setContact] = useState(null); // 編集対象の問い合わせデータ
  const [error, setError] = useState(""); // エラーメッセージ管理
  const navigate = useNavigate(); // ページ遷移用フック

  // コンポーネントマウント時に問い合わせデータを取得
  useEffect(() => {
    const fetchContact = async () => {
      try {
        // APIから問い合わせ詳細を取得
        const res = await authorizedRequest(
          "GET",
          `/api/contacts/${id}`, // 問い合わせID付きURL
          token
        );
        setContact(res); // 取得データをステートにセット
      } catch (err) {
        console.error("取得失敗:", err);
        setError("問い合わせデータの取得に失敗しました"); // エラー発生時の表示用
      }
    };

    fetchContact();
  }, [id, token]); // id または token が変わった場合に再実行

  // エラー表示
  if (error) return <p className="text-red-500">{error}</p>;

  // データ未取得時は読み込み中表示
  if (!contact) return <p>読み込み中...</p>;

  // ContactForm コンポーネントに編集対象データを渡す
  return (
    <ContactForm
      customerId={contact.customerId} // 関連顧客ID
      editingContact={contact} // 編集対象の問い合わせデータ
      onSuccess={() => navigate("/contacts")} // 更新成功時に問い合わせ一覧ページへ遷移
    />
  );
};

export default EditContactForm;
