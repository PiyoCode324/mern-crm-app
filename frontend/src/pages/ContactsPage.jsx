// src/pages/ContactsPage.jsx
import { useState } from "react";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";

const ContactsPage = () => {
  const [editingContact, setEditingContact] = useState(null);

  const clearEditing = () => setEditingContact(null);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">問い合わせ管理</h2>

      <ContactForm
        editingContact={editingContact}
        onSuccess={clearEditing}
        onCancelEdit={clearEditing}
      />

      <ContactList onEdit={setEditingContact} />
    </div>
  );
};

export default ContactsPage;
