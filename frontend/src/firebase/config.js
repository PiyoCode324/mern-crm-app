// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNtzFwUKZpsyNH8XMWFSO4LSSvrI2iZr0",
  authDomain: "mern-crm-app.firebaseapp.com",
  projectId: "mern-crm-app",
  storageBucket: "mern-crm-app.firebasestorage.app",
  messagingSenderId: "1078307302815",
  appId: "1:1078307302815:web:bff8f78a6fdad5226161aa",
};

// Firebaseアプリ初期化
const app = initializeApp(firebaseConfig);

// 認証の初期化
export const auth = getAuth(app);
