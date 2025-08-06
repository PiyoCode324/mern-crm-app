// src/pages/ContactsPage.jsx

import { useState } from "react";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";

const ContactsPage = () => {
  const [editingContact, setEditingContact] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleSuccess = () => {
    setRefreshList((prev) => prev + 1);
    setEditingContact(null);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">問い合わせ管理</h2>

      <ContactForm
        editingContact={editingContact}
        onSuccess={handleSuccess}
        onCancelEdit={handleCancelEdit}
      />

      <div className="mt-8">
        <ContactList onEdit={setEditingContact} refreshTrigger={refreshList} />
      </div>
    </div>
  );
};

export default ContactsPage;
