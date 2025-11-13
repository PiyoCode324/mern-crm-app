// src/firebase/config.js
// Firebaseの初期化設定ファイル
// Firebase Authentication と Firestore データベースを利用できるように設定

import { initializeApp } from "firebase/app"; // Firebaseアプリの初期化
import { getAuth } from "firebase/auth"; // 認証（Authentication）機能
import { getFirestore } from "firebase/firestore"; // Firestore データベース機能

// Firebaseプロジェクトの設定情報
// 環境変数から読み込むことで、コードに直接書かず安全に管理
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase Authentication のインスタンスを作成
export const auth = getAuth(app);

// Firestore データベースのインスタンスを作成
export const db = getFirestore(app);
