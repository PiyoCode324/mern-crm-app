// src/pages/FreeContactPage.jsx

import ContactForm from "../components/ContactForm";

const FreeContactPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">新規お問い合わせ</h1>
      <p className="mb-6">
        以下のフォームに必要事項をご記入ください。担当者より改めてご連絡いたします。
      </p>
      {/* ContactFormを再利用。customerIdを渡さない */}
      <ContactForm />
    </div>
  );
};

export default FreeContactPage;
