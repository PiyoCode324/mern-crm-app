// src/components/Contact/ContactForm.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Firebase 認証情報を取得
import { authorizedRequest } from "../services/authService"; // 認証付きリクエスト送信用
import { useNavigate } from "react-router-dom";
import { fetchAndMergeUserData } from "../utils/mergeUserData"; // Firebase と MongoDB のユーザーデータ統合

/**
 * ContactForm コンポーネント
 * - 公開フォーム（顧客用）と社内管理フォーム（ユーザー用）の両方に対応
 * - 新規登録 / 編集を共通化
 *
 * @param {object} contact - 編集対象の問い合わせデータ（新規の場合は null）
 * @param {function} onSuccess - 成功時のコールバック（例: リスト更新）
 * @param {function} onCancel - キャンセル時のコールバック
 * @param {string} customerId - 紐付ける顧客ID
 * @param {boolean} isPublic - 公開フォームモードかどうか（デフォルト: false）
 * @param {array} users - 担当者割り当て用のユーザー一覧
 */
const ContactForm = ({
  contact,
  onSuccess,
  onCancel,
  customerId,
  isPublic = false,
  users = [],
}) => {
  const { user: firebaseUser } = useAuth(); // Firebase 認証ユーザー
  const navigate = useNavigate();

  // DB統合済みのユーザー情報
  const [user, setUser] = useState(null);

  // フォームデータ（新規/編集共通）
  const [formData, setFormData] = useState({
    customerName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    content: "",
    responseStatus: "未対応",
    memo: "",
    customerId: customerId || "",
    assignedUserId: "",
  });

  const [error, setError] = useState(null); // エラーメッセージ
  const [isNew, setIsNew] = useState(true); // 新規かどうか

  // --- Firebase + MongoDBユーザー統合処理 ---
  useEffect(() => {
    const fetchUser = async () => {
      if (firebaseUser) {
        const merged = await fetchAndMergeUserData(firebaseUser);
        setUser(merged);
      }
    };
    fetchUser();
  }, [firebaseUser]);

  // --- フォームの初期化 ---
  useEffect(() => {
    if (contact) {
      // 編集モード
      setFormData({
        customerName: contact.customerName || "",
        contactName: contact.contactName || "",
        contactEmail: contact.contactEmail || "",
        contactPhone: contact.contactPhone || "",
        content: contact.content || "",
        responseStatus: contact.responseStatus || "未対応",
        memo: contact.memo || "",
        customerId: contact.customerId || "",
        assignedUserId: contact.assignedUserId || "",
      });
      setIsNew(false);
    } else {
      // 新規モード
      setFormData((prev) => ({
        ...prev,
        customerName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        content: "",
        responseStatus: "未対応",
        memo: "",
        customerId: customerId || "",
        assignedUserId: "",
      }));
      setIsNew(true);
    }
  }, [contact, customerId]);

  // --- 入力変更処理 ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- フォーム送信処理 ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 公開フォームはログイン不要、管理用フォームはログイン必須
    if (!isPublic && !user) {
      setError("ログインしてください。");
      return;
    }

    // 担当者割り当て（公開フォームでは null）
    const assignedUserId = isPublic
      ? null
      : formData.assignedUserId || user?.uid;

    try {
      if (isNew) {
        // 新規登録
        await authorizedRequest(
          "POST",
          isPublic ? "/contacts/public" : "/contacts",
          { ...formData, assignedUserId }
        );
      } else {
        // 更新
        await authorizedRequest("PUT", `/contacts/${contact._id}`, formData);
      }
      setError(null);

      // 成功後の処理
      if (onSuccess) {
        onSuccess();
      } else if (!isPublic) {
        navigate("/contacts");
      }
    } catch (err) {
      console.error("フォーム送信失敗:", err);
      setError(err.response?.data?.error || "処理に失敗しました。");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      {/* フォームタイトル（モードによって切り替え） */}
      <h3 className="text-lg font-bold mb-4">
        {isPublic
          ? "お問い合わせフォーム"
          : isNew
          ? "新規問い合わせ登録"
          : "問い合わせ編集"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* エラー表示 */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* 会社名 */}
        <div>
          <label
            htmlFor="customerName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            会社名
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>

        {/* 氏名 */}
        <div>
          <label
            htmlFor="contactName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {isPublic ? "氏名" : "お名前"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>

        {/* メール */}
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>

        {/* 電話 */}
        <div>
          <label
            htmlFor="contactPhone"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            電話番号
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>

        {/* 内容 */}
        <div>
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3"
          ></textarea>
        </div>

        {/* 担当者割り当て（管理者のみ） */}
        {user?.role === "admin" && !isPublic && (
          <div>
            <label
              htmlFor="assignedUserId"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              担当者割り当て
            </label>
            <select
              id="assignedUserId"
              name="assignedUserId"
              value={formData.assignedUserId || ""}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3"
            >
              <option value="">未割り当て</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 対応状況（ログイン時のみ表示） */}
        {user && (
          <div>
            <label
              htmlFor="responseStatus"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              対応状況
            </label>
            <select
              id="responseStatus"
              name="responseStatus"
              value={formData.responseStatus}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3"
            >
              <option value="未対応">未対応</option>
              <option value="対応中">対応中</option>
              <option value="対応済み">対応済み</option>
            </select>
          </div>
        )}

        {/* メモ（ログイン時のみ表示） */}
        {user && (
          <div>
            <label
              htmlFor="memo"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              メモ
            </label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3"
            ></textarea>
          </div>
        )}

        {/* ボタン */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isPublic ? "送信" : isNew ? "登録" : "更新"}
          </button>
          {(onCancel || !isNew) && (
            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                else navigate("/contacts");
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
