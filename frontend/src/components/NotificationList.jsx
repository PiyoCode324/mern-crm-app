// // src/components/NotificationList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { markNotificationAsRead } from "../services/notificationService";

const NotificationList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifData);
    });

    return () => unsubscribe();
  }, [userId]);

  // 通知クリック時に既読にする
  const handleNotificationClick = async (id) => {
    await markNotificationAsRead(id);
  };

  return (
    <div className="notification-list">
      {notifications.length === 0 ? (
        <p>通知はありません</p>
      ) : (
        notifications.map((n) => (
          <div
            className={`notification-item p-3 mb-2 rounded border cursor-pointer 
    ${n.read ? "bg-gray-100 font-normal" : "bg-blue-200 font-bold"} 
    hover:bg-blue-300 transition`}
            onClick={() => handleNotificationClick(n.id)}
          >
            {n.message}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
