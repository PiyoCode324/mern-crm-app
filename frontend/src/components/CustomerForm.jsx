// src/components/CustomerForm.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const CustomerForm = ({ editingCustomer, onSuccess, onCancelEdit }) => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    status: "見込み",
    contactMemo: "",
  });

  const [error, setError] = useState("");

  // 編集対象の顧客データをフォームにセット
  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || "",
        companyName: editingCustomer.companyName || "",
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        status: editingCustomer.status || "見込み",
        contactMemo: editingCustomer.contactMemo || "",
      });
    } else {
      setFormData({
        name: "",
        companyName: "",
        email: "",
        phone: "",
        status: "見込み",
        contactMemo: "",
      });
    }
  }, [editingCustomer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user || !token) {
      setError("ログインしてください");
      return;
    }

    try {
      if (editingCustomer) {
        // 編集モード（PUT）
        await authorizedRequest(
          "PUT",
          `/api/customers/${editingCustomer._id}`,
          token,
          formData
        );
      } else {
        // 登録モード（POST）
        await authorizedRequest("POST", "/api/customers", token, formData);
      }

      // フォーム初期化
      setFormData({
        name: "",
        companyName: "",
        email: "",
        phone: "",
        status: "見込み",
        contactMemo: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("送信エラー:", err);
      setError("送信に失敗しました");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg shadow-md max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold">
        {editingCustomer ? "顧客情報の編集" : "顧客登録"}
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="顧客名 *"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="companyName"
        placeholder="会社名"
        value={formData.companyName}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="phone"
        placeholder="電話番号"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="見込み">見込み</option>
        <option value="提案中">提案中</option>
        <option value="契約済">契約済</option>
        <option value="失注">失注</option>
      </select>

      <textarea
        name="contactMemo"
        placeholder="メモ・対応履歴など"
        value={formData.contactMemo}
        onChange={handleChange}
        rows={4}
        className="w-full p-2 border rounded"
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingCustomer ? "更新" : "登録"}
        </button>

        {editingCustomer && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                companyName: "",
                email: "",
                phone: "",
                status: "見込み",
                contactMemo: "",
              });
              if (onCancelEdit) onCancelEdit();
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};

export default CustomerForm;
