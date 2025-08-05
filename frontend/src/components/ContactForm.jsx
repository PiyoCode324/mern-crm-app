// src/components/ContactForm.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const ContactForm = ({
  customerId,
  editingContact,
  onSuccess,
  onCancelEdit,
}) => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name || "",
        email: editingContact.email || "",
        message: editingContact.message || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    }
  }, [editingContact]);

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

    if (!customerId) {
      setError("顧客IDが指定されていません");
      return;
    }

    try {
      const payload = { ...formData, customerId };

      if (editingContact) {
        // 編集モード（PUT）
        await authorizedRequest(
          "PUT",
          `/api/contacts/${editingContact._id}`,
          token,
          payload
        );
      } else {
        // 登録モード（POST）
        await authorizedRequest("POST", "/api/contacts", token, payload);
      }

      setFormData({
        name: "",
        email: "",
        message: "",
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
      className="space-y-4 p-4 border rounded shadow-md max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold">
        {editingContact ? "問い合わせ編集" : "問い合わせ登録"}
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="名前 *"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="メールアドレス *"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="message"
        placeholder="メッセージ *"
        value={formData.message}
        onChange={handleChange}
        required
        rows={4}
        className="w-full p-2 border rounded"
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingContact ? "更新" : "登録"}
        </button>

        {editingContact && (
          <button
            type="button"
            onClick={() => {
              setFormData({ name: "", email: "", message: "" });
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

export default ContactForm;
