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
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    content: "",
    responseStatus: "未対応",
    memo: "",
    assignedUserId: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingContact) {
      setFormData({
        contactName: editingContact.contactName || "",
        contactEmail: editingContact.contactEmail || "",
        contactPhone: editingContact.contactPhone || "",
        content: editingContact.content || "",
        responseStatus: editingContact.responseStatus || "未対応",
        memo: editingContact.memo || "",
        assignedUserId: editingContact.assignedUserId || "",
      });
    } else {
      setFormData({
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        content: "",
        responseStatus: "未対応",
        memo: "",
        assignedUserId: "",
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

    if (!user) {
      setError("ログインしてください");
      return;
    }

    try {
      let payload = {};
      if (editingContact) {
        payload = {
          ...formData,
          customerId: editingContact.customerId,
        };
        await authorizedRequest(
          "PUT",
          `/contacts/${editingContact._id}`,
          payload
        );
      } else {
        payload = {
          ...formData,
          assignedUserId: user.uid,
          customerId: customerId || null,
        };
        await authorizedRequest("POST", "/contacts", payload);
      }

      setFormData({
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        content: "",
        responseStatus: "未対応",
        memo: "",
        assignedUserId: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("送信エラー:", err);
      setError(err.response?.data?.error || "送信に失敗しました。");
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
        name="contactName"
        placeholder="氏名 *"
        value={formData.contactName}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="contactEmail"
        placeholder="メールアドレス *"
        value={formData.contactEmail}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="tel"
        name="contactPhone"
        placeholder="電話番号"
        value={formData.contactPhone}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <textarea
        name="content"
        placeholder="内容 *"
        value={formData.content}
        onChange={handleChange}
        required
        rows={4}
        className="w-full p-2 border rounded"
      />

      {editingContact && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              担当者ID
            </label>
            <input
              type="text"
              name="assignedUserId"
              placeholder="担当者ID"
              value={formData.assignedUserId}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              対応ステータス
            </label>
            <select
              name="responseStatus"
              value={formData.responseStatus}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="未対応">未対応</option>
              <option value="対応中">対応中</option>
              <option value="対応済み">対応済み</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              メモ
            </label>
            <textarea
              name="memo"
              placeholder="メモ"
              value={formData.memo}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
        </>
      )}

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
            onClick={onCancelEdit}
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
